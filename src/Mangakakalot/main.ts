import { 
    DiscoverSection, 
    PagedResults, 
    SearchQuery, 
    SearchResultItem, 
    Tag, 
    TagSection 
} from '@paperback/types'
import { decodeHTML } from 'entities'
import { MangaBox } from '../MangaBox'
import { URLBuilder } from '../MangaBoxHelpers'
import { SITE_DOMAIN } from './pbconfig'

class MangakakalotSource extends MangaBox {
    // Website base URL.
    baseURL = SITE_DOMAIN

    // Language code supported by the source.
    languageCode = '🇬🇧'

    // Path for manga list.
    mangaListPath = 'manga_list'

    // Selector for manga in manga list.
    mangaListSelector = 'div.truyen-list div.list-truyen-item-wrap'

    // Selector for subtitle in manga list.
    mangaSubtitleSelector = 'a.list-story-item-wrap-chapter'

    override async supportsTagExclusion(): Promise<boolean> {
        return false
    }

    override async getDiscoverSectionTitles(section: DiscoverSection, metadata: any): Promise<PagedResults<SearchResultItem>> {
        const page: number = metadata?.page ?? 1

        const request = {
            url: new URLBuilder(this.baseURL)
                .addPathComponent(this.mangaListPath)
                .addQueryParameter('type', section.id)
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

    override async getSearchResults(query: SearchQuery, metadata: any): Promise<PagedResults<SearchResultItem>> {
        const page: number = metadata?.page ?? 1
        let results: SearchResultItem[] = []

        //TODO 
        if (query.includedTags && query.includedTags?.length != 0) {
            const request = {
                url: new URLBuilder(this.baseURL)
                    .addPathComponent('manga_list')
                    //TODO
                    //.addQueryParameter('category', query.includedTags[0]?.id)
                    .addQueryParameter('page', page)
                    .buildUrl(),
                method: 'GET'
            }

            const [, data] = await Application.scheduleRequest(request)
            const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))

            results = this.parser.parseManga($, this)
            metadata = !this.parser.isLastPage($) ? { page: page + 1 } : undefined
        } else {
            const request = {
                url: new URLBuilder(this.baseURL)
                    .addPathComponent('search')
                    .addPathComponent('story')
                    .addPathComponent(query.title?.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ +/g, '_').toLowerCase() ?? '')
                    .addQueryParameter('page', page)
                    .buildUrl(),
                method: 'GET'
            }

            const [, data] = await Application.scheduleRequest(request)
            const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))

            const collecedIds: string[] = []

            for (const manga of $('div.panel_story_list div.story_item').toArray()) {
                const mangaId = $('a', manga).first().attr('href')
                const image = $('img', manga).first().attr('src') ?? ''
                const title = decodeHTML($('h3.story_name a', manga).first().text().trim() ?? '')
                const subtitle = decodeHTML($('h3.story_name + em.story_chapter a', manga).text().trim() ?? '')

                if (!mangaId || !title || collecedIds.includes(mangaId)) continue
                results.push({
                    mangaId: mangaId,
                    imageUrl: image,
                    title: title,
                    subtitle: subtitle ? subtitle : 'No Chapters'
                })
                collecedIds.push(mangaId)
            }
            metadata = !this.parser.isLastPage($) ? { page: page + 1 } : undefined
        }

        return {
            items: results,
            metadata: metadata
        }
    }
    /* eslint-enable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */

    parseTagId(url: string): string | undefined {
        return url.split('category=').pop()?.split('&')[0]?.replace(/[^0-9]/g, '')
    }

    override async getSearchTags(): Promise<TagSection[]> {
        const request = {
            url: this.baseURL,
            method: 'GET'
        }

        const [, data] = await Application.scheduleRequest(request)
        const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))

        const tags: Tag[] = []

        for (const tag of $('div.panel-category tbody a').toArray()) {
            const id = this.parseTagId($(tag).attr('href') ?? '')
            const title = $(tag).text().trim()
            if (!id || !title) continue
            tags.push({ id: id, title: title })
        }

        const TagSection: TagSection[] = [
            {
                id: '0',
                title: 'genres',
                tags: tags
            }
        ]
        return TagSection
    }
}


export const Mangakakalot = new MangakakalotSource()

