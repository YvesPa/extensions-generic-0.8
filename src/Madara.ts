import {
    Chapter,
    ChapterDetails,
    PagedResults,
    SourceManga,
    TagSection,
    Request,
    Response,
    SearchResultsProviding,
    ChapterProviding,
    Extension,
    SettingsFormProviding,
    BasicRateLimiter,
    Form,
    SearchQuery,
    SearchResultItem,
    DiscoverSection,
    DiscoverSectionType,
    CloudflareBypassRequestProviding,
    Cookie,
    CloudflareError
} from '@paperback/types'

import { Parser } from './MadaraParser'
import { URLBuilder } from './MadaraHelper'

import * as cheerio from 'cheerio'

import { MadaraSettingForm } from './MadaraSettings'

export abstract class Madara implements Extension, SearchResultsProviding, ChapterProviding, SettingsFormProviding, CloudflareBypassRequestProviding {
    cheerio = cheerio
    /**
     *  Request manager override
     */
    requestsPerSecond = 5
    requestTimeout = 20000
    globalRateLimiter = new BasicRateLimiter('rateLimiter', this.requestsPerSecond, 1)
    filterFail = false

    async initialise(): Promise<void> {
        this.globalRateLimiter.registerInterceptor()
        Application.registerInterceptor(
            'madaraInterceptor',
            Application.Selector(this as Madara, 'interceptRequest'),
            Application.Selector(this as Madara, 'interceptResponse')
        )
        this.registerDiscoverSections()
        await this.registerSearchFilters()
    }

    async interceptRequest(request: Request): Promise<Request> {
        request.headers = {
            ...(request.headers ?? {}),
            ...{
                'user-agent': await Application.getDefaultUserAgent(),
                'referer': `${this.baseUrl}/`,
                'origin': `${this.baseUrl}/`,
                ...(request.url.includes('wordpress.com') && { 'Accept': 'image/avif,image/webp,*/*' }) // Used for images hosted on Wordpress blogs
            }
        }
        
        request.cookies = {
            'wpmanga-adault': '1',
            'toonily-mature': '1'
        }
        
        const cloudflareCookies = Application.getState('cloudflareCookies') as string
        console.log('Loading cookies: >'+cloudflareCookies+'<')
        if (cloudflareCookies){
            (JSON.parse(cloudflareCookies) as Cookie[]).forEach(cookie => {
                if (request.cookies) request.cookies[cookie.name] = cookie.value
            })
        }

        return request
    }

    async interceptResponse(request: Request, response: Response, data: ArrayBuffer): Promise<ArrayBuffer> {
        return data
    }

    async getSettingsForm(): Promise<Form> {
        return new MadaraSettingForm()
    }

    async registerSearchFilters(): Promise<void> {
        let genres: TagSection[]
        try {
            genres = await this.getSearchTags()
            this.filterFail = false
        } 
        catch(exception)
        {
            this.filterFail = true
            return
        }

        Application.registerSearchFilter({
            id: 'genre_operation',
            title: 'Genres operation',
            type: 'dropdown',
            options: [
                { id: '', value: 'or' },
                { id: '1', value: 'and' }
            ],
            value: ''
        })

        genres.forEach(genre => {
            Application.registerSearchFilter({
                id: genre.id,
                title: genre.title,
                type: 'multiselect',
                options: genre.tags.map(tag => ({ id: tag.id, value: tag.title })),
                value: {},
                allowExclusion: false
            })
        })
    }

    /**
    * The Madara URL of the website. Eg. https://webtoon.xyz
    */
    abstract baseUrl: string

    /**
     * The language code the source's content is served in in string form.
     */
    language = '🇬🇧'

    /**
     * Different Madara sources might have a slightly different selector which is required to parse out
     * each manga object while on a search result page. This is the selector
     * which is looped over. This may be overridden if required.
     */
    searchMangaSelector = 'div.c-tabs-item__content'

    /**
     * Set to true if your source has advanced search functionality built in.
     * If this is not true, no genre tags will be shown on the homepage!
     * See https://www.webtoon.xyz/?s=&post_type=wp-manga if they have a "advanced" option, if NOT, set this to false.
     */
    hasAdvancedSearchPage = true

    /**
     * The path used for search pagination. Used in search function.
     * Eg. for https://mangabob.com/page/2/?s&post_type=wp-manga it would be 'page'
     */
    searchPagePathName = 'page'

    /**
     * Set to true if the source makes use of the manga chapter protector plugin.
     * (https://mangabooth.com/product/wp-manga-chapter-protector/)
     */
    hasProtectedChapters = false

    /**
     * Some sources may in the future change how to get the chapter protector data,
     * making it configurable, will make it way more flexible and open to customized installations of the protector plugin.
     */
    protectedChapterDataSelector = '#chapter-protector-data'

    /**
     * Some sites use the alternate URL for getting chapters through ajax
     * 0: (POST) Form data https://domain.com/wp-admin/admin-ajax.php
     * 1: (POST) Alternative Ajax page (https://domain.com/manga/manga-slug/ajax/chapters)
     * 2: (POST) Manga page (https://domain.com/manga/manga-slug)
     * 3: (GET) Manga page (https://domain.com/manga/manga-slug)
     */
    chapterEndpoint = 0

    /**
     * Different Madara sources might have a slightly different selector which is required to parse out
     * each page while on a chapter page. This is the selector
     * which is looped over. This may be overridden if required.
     */
    chapterDetailsSelector = 'div.page-break > img'

    /**
     * Some websites have the Cloudflare defense check enabled on specific parts of the website, these need to be loaded when using the Cloudflare bypass within the app
     */
    bypassPage = ''

    /**
     * If it's not possible to use postIds for certain reasons, you can disable this here.
     */
    usePostIds = true

    /**
     * When not using postIds, you need to set the directory path
     */
    directoryPath = 'manga'

    /**
     * Some sources may redirect to the manga page instead of the chapter page if adding the parameter '?style=list'
     */
    useListParameter = true

    parser = new Parser()

    getMangaShareUrl(mangaId: string): string {
        return this.usePostIds ? `${this.baseUrl}/?p=${mangaId}/` : `${this.baseUrl}/${this.directoryPath}/${mangaId}/`
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = {
            url: this.usePostIds ? `${this.baseUrl}/?p=${mangaId}/` : `${this.baseUrl}/${this.directoryPath}/${mangaId}/`,
            method: 'GET'
        }

        const [response, data] = await Application.scheduleRequest(request)
        await this.checkResponseError(response, request)
        const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))

        return this.parser.parseMangaDetails($, mangaId, this)
    }

    async getChapters(sourceManga: SourceManga): Promise<Chapter[]> {
        let requestConfig : Request
        let path = this.directoryPath
        const mangaId = sourceManga.mangaId
        let slug = mangaId

        if (this.usePostIds) {
            const postData = await this.convertPostIdToSlug(Number(mangaId))
            path = postData.path
            slug = postData.slug
        }

        switch (this.chapterEndpoint) {
            case 0:
                requestConfig = {
                    url: `${this.baseUrl}/wp-admin/admin-ajax.php`,
                    method: 'POST',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    body: {
                        'action': 'manga_get_chapters',
                        'manga': this.usePostIds ? mangaId : await this.convertSlugToPostId(mangaId, this.directoryPath)
                    }
                }
                break

            case 1:
                requestConfig = {
                    url: `${this.baseUrl}/${path}/${slug}/ajax/chapters`,
                    method: 'POST',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    }
                }
                break

            case 2:
                requestConfig = {
                    url: `${this.baseUrl}/${path}/${slug}`,
                    method: 'POST',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    }
                }
                break

            case 3:
                requestConfig = {
                    url: `${this.baseUrl}/${path}/${slug}`,
                    method: 'GET',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    }
                }
                break

            default:
                throw new Error('Invalid chapter endpoint!')
        }

        const request = requestConfig

        const [response, data] = await Application.scheduleRequest(request)
        await this.checkResponseError(response, request)
        const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))

        return this.parser.parseChapterList($, sourceManga, this)
    }

    async getChapterDetails(chapter: Chapter): Promise<ChapterDetails> {
        const mangaId = chapter.sourceManga.mangaId
        const chapterId = chapter.chapterId

        let url: string
        if (this.usePostIds) {
            const slugData: any = await this.convertPostIdToSlug(Number(mangaId))
            url = `${this.baseUrl}/${slugData.path}/${slugData.slug}/${chapterId}/${this.useListParameter ? '?style=list' : ''}`
        } else {
            url = `${this.baseUrl}/${this.directoryPath}/${mangaId}/${chapterId}/${this.useListParameter ? '?style=list' : ''}`
        }

        const request = {
            url: url,
            method: 'GET'
        }

        const [response, data] = await Application.scheduleRequest(request)
        await this.checkResponseError(response, request)
        const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))

        if (this.hasProtectedChapters) {
            return this.parser.parseProtectedChapterDetails($, mangaId, chapterId, this.protectedChapterDataSelector, this)
        }

        return this.parser.parseChapterDetails($, mangaId, chapterId, this.chapterDetailsSelector, this)
    }

    async getSearchTags(): Promise<TagSection[]> {
        let request
        if (this.hasAdvancedSearchPage) {
            // Adding the fake query "the" since some source revert to homepage when none is given!
            request = {
                url: `${this.baseUrl}/?s=the&post_type=wp-manga`,
                method: 'GET'
            }
        } else {
            request = {
                url: `${this.baseUrl}/`,
                method: 'GET'
            }
        }

        const [response, data] = await Application.scheduleRequest(request)
        await this.checkResponseError(response, request)
        const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))

        return this.parser.parseTags($, this.hasAdvancedSearchPage)
    }



    async getSearchResults(query: SearchQuery, metadata: any): Promise<PagedResults<SearchResultItem>> {
        // If we're supplied a page that we should be on, set our internal reference to that page. Otherwise, we start from page 0.
        const page = metadata?.page ?? 1

        const request = this.constructSearchRequest(page, query)
        const [response, data] = await Application.scheduleRequest(request)
        await this.checkResponseError(response, request)
        const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))
        const results = await this.parser.parseSearchResults($, this)

        const manga: SearchResultItem[] = []
        for (const result of results) {
            if (this.usePostIds) {
                const postId = await this.slugToPostId(result.slug, result.path)

                manga.push({
                    mangaId: String(postId),
                    imageUrl: result.image,
                    title: result.title,
                    subtitle: result.subtitle
                })
            } else {
                manga.push({
                    mangaId: result.slug,
                    imageUrl: result.image,
                    title: result.title,
                    subtitle: result.subtitle
                })
            }
        }

        return {
            items: manga,
            metadata: { page: (page + 1) }
        }
    }

    sectionsParams : Record<string, {page:number, postsPerPage:number, meta_key: string, meta_value?: string}> = {
        id_0: {page: 0, postsPerPage: 10, meta_key: '_latest_update'},
        id_1: {page: 0, postsPerPage: 10, meta_key: '_wp_manga_week_views_value'},
        id_2: {page: 0, postsPerPage: 10, meta_key: '_wp_manga_views'},
        id_3: {page: 0, postsPerPage: 10, meta_key: '_wp_manga_status', meta_value: 'end'}
    }
    async getDiscoverSectionTitles(section: DiscoverSection, metadata: any): Promise<PagedResults<SearchResultItem>> {
        const params = this.sectionsParams[section.id]
        if (!params) throw new Error('Invalid section id!')
        
        const page = metadata ? (metadata.page ?? 0 ) : params.page
        const postsPerPage = metadata ? 50 : params.postsPerPage

        const request = this.constructAjaxHomepageRequest(page, postsPerPage, params.meta_key, params.meta_value)

        const [response, data] = await Application.scheduleRequest(request)
        await this.checkResponseError(response, request)
        const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))
        const results = await this.parser.parseDiscoverSection($, this)
        return {
            items: results,
            metadata: metadata || results.length < 50 ? undefined : { page: (page + 1) }
        }
    }
    

    async registerDiscoverSections(): Promise<void> {
        const sections = [
            { 
                id: 'id_0',
                title: 'Recently Updated',
                type: DiscoverSectionType.simpleCarousel
            },
            {
                id: 'id_1',
                title: 'Currently Trending',
                type: DiscoverSectionType.simpleCarousel
            },
            {
                id: 'id_2',
                title: 'Most Popular',
                type: DiscoverSectionType.simpleCarousel
            },
            {
                id: 'id_3',
                title: 'Completed',
                type: DiscoverSectionType.simpleCarousel
            }
        ]

        for (const section of sections) {
            Application.registerDiscoverSection(section, Application.Selector(this as Madara, 'getDiscoverSectionTitles'))
        }
    }

    // Utility
    constructSearchRequest(page: number, query: SearchQuery): any {
        const filterGenre = query?.filters?.find(f => f.id === 'genre')?.value
        const genre = filterGenre ? Object.keys(filterGenre) : undefined
        const genre_operation = query?.filters?.find(f => f.id === 'genre_operation')?.value

        return {
            url: new URLBuilder(this.baseUrl)
                .addPathComponent(this.searchPagePathName)
                .addPathComponent(page.toString())
                .addQueryParameter('s', encodeURIComponent(query?.title ?? ''))
                .addQueryParameter('post_type', 'wp-manga')
                .addQueryParameter('genre', genre)
                .addQueryParameter('op', genre_operation)
                .buildUrl({ addTrailingSlash: true, includeUndefinedParameters: false }),
            method: 'GET'
        }
    }

    constructAjaxHomepageRequest(page: number, postsPerPage: number, meta_key: string, meta_value?: string): Request {
        return {
            url: `${this.baseUrl}/wp-admin/admin-ajax.php`,
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: {
                'action': 'madara_load_more',
                'template': 'madara-core/content/content-archive',
                'page': page,
                'vars[paged]': '1',
                'vars[posts_per_page]': postsPerPage,
                'vars[orderby]': 'meta_value_num',
                'vars[sidebar]': 'right',
                'vars[post_type]': 'wp-manga',
                'vars[order]': 'desc',
                'vars[meta_key]': meta_key,
                'vars[meta_value]': meta_value
            }
        }
    }

    async slugToPostId(slug: string, path: string): Promise<string> {
        if (Application.getState(slug) == null) {
            const postId = await this.convertSlugToPostId(slug, path)

            const existingMappedSlug = Application.getState(postId) as string
            if (existingMappedSlug != null) {
                Application.setState(undefined, existingMappedSlug)
            }

            Application.setState(slug, postId)
            Application.setState(postId, slug)
        }

        const postId = Application.getState(slug) as string
        if (!postId) throw new Error(`Unable to fetch postId for slug:${slug}`)

        return postId
    }

    async convertPostIdToSlug(postId: number) {
        const request = {
            url: `${this.baseUrl}/?p=${postId}`,
            method: 'GET'
        }

        const [response, data] = await Application.scheduleRequest(request)
        const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))

        let parseSlug: any
        // Step 1: Try to get slug from og-url
        parseSlug = String($('meta[property="og:url"]').attr('content'))

        // Step 2: Try to get slug from canonical
        if (!parseSlug.includes(this.baseUrl)) {
            parseSlug = String($('link[rel="canonical"]').attr('href'))
        }

        if (!parseSlug || !parseSlug.includes(this.baseUrl)) {
            throw new Error('Unable to parse slug!')
        }

        parseSlug = parseSlug
            .replace(/\/$/, '')
            .split('/')

        const slug = parseSlug.slice(-1).pop()
        const path = parseSlug.slice(-2).shift()

        return { path, slug }
    }

    async convertSlugToPostId(slug: string, path: string): Promise<string> { // Credit to the MadaraDex team :-D
        const headRequest = {
            url: `${this.baseUrl}/${path}/${slug}/`,
            method: 'HEAD'
        }
        const [headResponse, headData] = await Application.scheduleRequest(headRequest)

        let postId: any

        const postIdRegex = headResponse?.headers['Link']?.match(/\?p=(\d+)/)
        if (postIdRegex && postIdRegex[1]) postId = postIdRegex[1]
        if (postId || !isNaN(Number(postId))) {
            return postId?.toString()
        } else {
            postId = ''
        }

        const request = {
            url: `${this.baseUrl}/${path}/${slug}/`,
            method: 'GET'
        }

        const [response, data] = await Application.scheduleRequest(request)
        const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))

        // Step 1: Try to get postId from shortlink
        postId = Number($('link[rel="shortlink"]')?.attr('href')?.split('/?p=')[1])

        // Step 2: If no number has been found, try to parse from data-post
        if (isNaN(postId)) {
            postId = Number($('a.wp-manga-action-button').attr('data-post'))
        }

        // Step 3: If no number has been found, try to parse from manga script
        if (isNaN(postId)) {
            const page = $.root().html()
            const match = page?.match(/manga_id.*\D(\d+)/)
            if (match && match[1]) {
                postId = Number(match[1]?.trim())
            }
        }

        if (!postId || isNaN(postId)) {
            throw new Error(`Unable to fetch numeric postId for this item! (path:${path} slug:${slug})`)
        }

        return postId.toString()
    }

    async getCloudflareBypassRequestAsync() {
        return {
            url: this.bypassPage || this.baseUrl,
            method: 'GET',
            headers: {
                'referer': `${this.baseUrl}/`,
                'origin': `${this.baseUrl}/`,
                'user-agent': await Application.getDefaultUserAgent()
            }
        }
    }

    async saveCloudflareBypassCookies(cookies: Cookie[]): Promise<void> {
        const cfCookies = cookies.filter(c => c.name.startsWith('cf') || c.name.startsWith('_cf') || c.name.startsWith('__cf'))
        Application.setState(JSON.stringify(cfCookies), 'cloudflareCookies')
        if (this.filterFail) {
            await this.registerSearchFilters()
        }
    }

    async checkResponseError(response: Response, request: Request): Promise<void> {
        const status = response.status
        switch (status) {
            case 403:
            case 503:
                throw new CloudflareError(await this.getCloudflareBypassRequestAsync(),'Cloudflare bypass error, press the red top bar to resolved !')
            case 404:
                throw new Error(`The requested page ${request.url} was not found!`)
        }
    }
}