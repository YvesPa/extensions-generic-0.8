import {
    BasicRateLimiter,
    Chapter,
    ChapterDetails,
    ChapterProviding,
    DiscoverSection,
    DiscoverSectionType,
    Extension,
    Form,
    PagedResults,
    Request,
    Response,
    SearchQuery,
    SearchResultItem,
    SearchResultsProviding,
    SettingsFormProviding,
    SourceManga,
    TagSection
} from '@paperback/types'

import { MangaBoxParser } from './MangaBoxParser'

import { URLBuilder } from './MangaBoxHelpers'

import {
    // chapterSettings,
    getImageServer,
    MangaBoxSettingForm
} from './MangaBoxSettings'

import * as cheerio from 'cheerio'

export abstract class MangaBox implements Extension, SearchResultsProviding, ChapterProviding, SettingsFormProviding {
    cheerio = cheerio

    // Website base URL. Eg. https://manganato.com
    abstract baseURL: string

    // Language code supported by the source.
    abstract languageCode: string

    // Path for manga list. Eg. https://manganato.com/genre-all the path is 'genre-all'
    abstract mangaListPath: string

    // Selector for manga in manga list.
    abstract mangaListSelector: string

    // Selector for subtitle in manga list.
    abstract mangaSubtitleSelector: string

    // Selector for genre list items.
    genreListSelector = 'div.advanced-search-tool-genres-list span.advanced-search-tool-genres-item'

    // Selector for status list items.
    statusListSelector = 'div.advanced-search-tool-status select.advanced-search-tool-status-content option'

    // Root selector for getMangaDetails.
    mangaRootSelector = 'div.panel-story-info, div.manga-info-top'

    // Selector for manga thumbnail.
    mangaThumbnailSelector = 'span.info-image img, div.manga-info-pic img'

    // Selector for manga main title.
    mangaTitleSelector = 'div.story-info-right h1, ul.manga-info-text li:first-of-type h1'

    // Selector for manga alternative titles.
    mangaAltTitleSelector = 'div.story-info-right td:contains(Alternative) + td h2,'
        + 'ul.manga-info-text h2.story-alternative'

    // Selector for manga status.
    mangaStatusSelector = 'div.story-info-right td:contains(Status) + td,'
        + 'ul.manga-info-text li:contains(Status)'

    // Selector for manga author.
    mangaAuthorSelector = 'div.story-info-right td:contains(Author) + td a,'
        + 'ul.manga-info-text li:contains(Author) a'

    // Selector for manga description.
    mangaDescSelector = 'div#panel-story-info-description, div#noidungm'

    // Selector for manga tags.
    mangaGenresSelector = 'div.story-info-right td:contains(Genre) + td a,'
        + 'ul.manga-info-text li:contains(Genres) a'

    // Selector for manga chapter list.
    chapterListSelector = 'div.panel-story-chapter-list ul.row-content-chapter li,'
        + 'div.manga-info-chapter div.chapter-list div.row'

    // Selector for manga chapter time updated.
    chapterTimeSelector = 'span.chapter-time, span'

    // Selector for manga chapter images.
    chapterImagesSelector = 'div.container-chapter-reader img'

    parser = new MangaBoxParser()

    /**
         *  Request manager override
         */
    requestsPerSecond = 3
    requestTimeout = 20000
    globalRateLimiter = new BasicRateLimiter('rateLimiter', this.requestsPerSecond, 1)
    filterFail = false

    async initialise(): Promise<void> {
        this.globalRateLimiter.registerInterceptor()
        Application.registerInterceptor(
            'madaraInterceptor',
            Application.Selector(this as MangaBox, 'interceptRequest'),
            Application.Selector(this as MangaBox, 'interceptResponse')
        )
        this.registerDiscoverSections()
        await this.registerSearchFilters()
    }

    async interceptRequest(request: Request): Promise<Request> {
        request.headers = {
            ...(request.headers ?? {}),
            ...{
                'referer': `${this.baseURL}/`,
                'user-agent': await Application.getDefaultUserAgent()
            }
        }
        return request
        
        /*
        const cloudflareCookies = Application.getState('cloudflareCookies') as string
        console.log('Loading cookies: >'+cloudflareCookies+'<')
        if (cloudflareCookies){
            (JSON.parse(cloudflareCookies) as Cookie[]).forEach(cookie => {
                if (request.cookies) request.cookies[cookie.name] = cookie.value
            })
        }

        return request*/
    }

    async interceptResponse(request: Request, response: Response, data: ArrayBuffer): Promise<ArrayBuffer> {
        return data
    }

    async getSettingsForm(): Promise<Form> {
        return new MangaBoxSettingForm()
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
                allowExclusion: true
            })
        })
    }

    async registerDiscoverSections(): Promise<void> {
        const sections2 = [
            { 
                id: 'latest',
                title: 'Latest Updates',
                type: DiscoverSectionType.simpleCarousel
            },
            {
                id: 'newest',
                title: 'New Titles',
                type: DiscoverSectionType.simpleCarousel
            },
            {
                id: 'id_2',
                title: 'Most Popular',
                type: DiscoverSectionType.simpleCarousel
            }
        ]

        for (const section of sections2) {
            Application.registerDiscoverSection(section, Application.Selector(this as MangaBox, 'getDiscoverSectionTitles'))
        }
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = {
            url: `${mangaId}`,
            method: 'GET'
        }

        const [, data] = await Application.scheduleRequest(request)
        const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))
        return this.parser.parseMangaDetails($, mangaId, this)
    }

    async getChapters(sourceManga: SourceManga): Promise<Chapter[]> {
        const request = {
            url: `${sourceManga.mangaId}`,
            method: 'GET'
        }

        const [, data] = await Application.scheduleRequest(request)
        const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))
        return this.parser.parseChapters($, sourceManga, this)
    }

    async getChapterDetails(chapter: Chapter): Promise<ChapterDetails> {
        const imageServer = getImageServer()

        const request = {
            url: `${chapter.chapterId}`,
            method: 'GET',
            cookies:{
                content_server : imageServer ?? 'server1'
            }
        }

        const [, data] = await Application.scheduleRequest(request)
        const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))
        return this.parser.parseChapterDetails($, chapter, this)
    }

    async getDiscoverSectionTitles(section: DiscoverSection, metadata: any): Promise<PagedResults<SearchResultItem>> {
        const page: number = metadata?.page ?? 1

        const request = {
            url: new URLBuilder(this.baseURL)
                .addPathComponent(`${this.mangaListPath}/${page}`)
                .addQueryParameter('type', section.id)
                .buildUrl(),
            method: 'GET'
        }

        const [, data] = await Application.scheduleRequest(request)
        const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))
        const results = this.parser.parseManga($, this)

        metadata = !this.parser.isLastPage($) ? { page: page + 1 } : undefined
        return {
            items: results,
            metadata: metadata
        }
    }

    async supportsTagExclusion(): Promise<boolean> {
        return true
    }

    async getSearchTags(): Promise<TagSection[]> {
        const request = {
            url: new URLBuilder(this.baseURL)
                .addPathComponent('advanced_search')
                .buildUrl(),
            method: 'GET'
        }

        const [, data] = await Application.scheduleRequest(request)
        const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))
        return this.parser.parseTags($, this)
    }

    async getSearchResults(query: SearchQuery, metadata: any): Promise<PagedResults<SearchResultItem>> {
        const page: number = metadata?.page ?? 1

        const request = {
            url: new URLBuilder(this.baseURL)
                .addPathComponent('advanced_search')
                .addQueryParameter('keyw', query.title?.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ +/g, '_').toLowerCase() ?? '')
                // TODO
                //.addQueryParameter('g_i', `_${query.includedTags?.map(t => t.id).join('_')}_`)
                //.addQueryParameter('g_e', `_${query.excludedTags?.map(t => t.id).join('_')}_`)
                .addQueryParameter('page', page)
                .buildUrl(),
            method: 'GET'
        }

        const [, data] = await Application.scheduleRequest(request)
        const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))
        const results = this.parser.parseManga($, this)

        metadata = !this.parser.isLastPage($) ? { page: page + 1 } : undefined
        return {
            items: results,
            metadata: metadata
        }
    }
}
