import {
    Chapter,
    ChapterDetails,
    ContentRating,
    SearchResultItem,
    SourceManga,
    Tag,
    TagSection
} from '@paperback/types'

import { decodeHTML } from 'entities'

import { CheerioAPI } from 'cheerio/lib/load'
import { Cheerio } from 'cheerio/lib/cheerio'
import { Element } from 'domhandler/lib/node'

import { MangaBox } from './MangaBox'

export class MangaBoxParser {
    parseManga = ($: CheerioAPI, source: MangaBox): SearchResultItem[] => {
        const mangaItems: SearchResultItem[] = []
        const collecedIds: string[] = []

        for (const manga of $(source.mangaListSelector).toArray()) {
            const mangaId = $('a', manga).first().attr('href')
            const image = $('img', manga).first().attr('src')?.trim() ?? ''
            const title = decodeHTML($('a', manga).first().attr('title')?.trim() ?? '')
            const subtitle = $(source.mangaSubtitleSelector, manga).first().text().trim() ?? ''

            if (!mangaId || !title || collecedIds.includes(mangaId)) continue
            mangaItems.push({
                mangaId: mangaId,
                imageUrl: image,
                title: title,
                subtitle: subtitle ? subtitle : 'No Chapters'
            })
            collecedIds.push(mangaId)
        }

        return mangaItems
    }

    parseMangaDetails = ($: CheerioAPI, mangaId: string, source: MangaBox): SourceManga => {
        const mangaRootSelector = $(source.mangaRootSelector)

        const thumbnailUrl = $(source.mangaThumbnailSelector).attr('src') ?? ''

        const primaryTitle = decodeHTML($(source.mangaTitleSelector, mangaRootSelector).text().trim())
        
        const secondaryTitles = []
        // Alternative Titles
        for (const altTitle of $(source.mangaAltTitleSelector, mangaRootSelector)
            .text()
            ?.split(/,|;|\//)) {
            if (altTitle == '') continue
            secondaryTitles.push(decodeHTML(altTitle.trim()))
        }

        const rawStatus = $(source.mangaStatusSelector, mangaRootSelector).text().trim() ?? 'ONGOING'
        let status = 'ONGOING'
        switch (rawStatus.toUpperCase()) {
            case 'ONGOING':
                status = 'Ongoing'
                break
            case 'COMPLETED':
                status = 'Completed'
                break
            default:
                status = 'Ongoing'
                break
        }

        const author = $(source.mangaAuthorSelector, mangaRootSelector)
            .toArray()
            .map(x => $(x).text().trim())
            .join(', ') ?? ''

        const synopsis = decodeHTML($(source.mangaDescSelector).first().children().remove().end().text().trim())

        const tags: Tag[] = []
        for (const tag of $(source.mangaGenresSelector, mangaRootSelector).toArray()) {
            const id = $(tag).attr('href')
            const title = $(tag).text().trim()

            if (!id || !title) continue
            tags.push({ id: id, title: title })
        }
        const tagGroups: TagSection[] = [
            {
                id: '0',
                title: 'genres',
                tags: tags
            }
        ]

        //TODO
        const contentRating = ContentRating.EVERYONE
        
        return {
            mangaId,
            mangaInfo: {
                primaryTitle,
                secondaryTitles,
                thumbnailUrl,
                author,
                tagGroups,
                synopsis,
                status,
                contentRating
            }
        }
    }

    parseChapters = ($: CheerioAPI, sourceManga: SourceManga, source: MangaBox): Chapter[] => {
        const chapters: (Chapter & {sortingIndex: number}) [] = []
        let sortingIndex = 0

        for (const chapter of $(source.chapterListSelector).toArray()) {
            const id = $('a', chapter).attr('href') ?? ''
            if (!id) continue

            const name = decodeHTML($('a', chapter).text().trim())
            const time = this.parseDate($(source.chapterTimeSelector, chapter).last().text().trim() ?? '')

            let chapNum = 0
            const chapRegex = id.match(/(?:chap.*)[-_](\d+\.?\d?)/)
            if (chapRegex && chapRegex[1]) chapNum = Number(chapRegex[1].replace(/\\/g, '.'))

            chapters.push({
                chapterId: id,
                sourceManga: sourceManga,
                langCode: source.languageCode,
                chapNum: isNaN(chapNum) ? 0 : chapNum,
                title: name,
                volume: 0,
                publishDate: time,
                sortingIndex: sortingIndex
            })
            sortingIndex--
        }

        // If there are no chapters, throw error to avoid losing progress
        if (chapters.length == 0) {
            throw new Error(`Couldn't find any chapters for mangaId: ${sourceManga.mangaId}!`)
        }

        return chapters.map((chapter) => {
            chapter.sortingIndex += chapters.length
            return chapter
        })
    }

    parseChapterDetails = async ($: CheerioAPI, chapter: Chapter, source: MangaBox): Promise<ChapterDetails> => {
        const pages: string[] = []

        for (const img of $(source.chapterImagesSelector).toArray()) {
            let image = $(img).attr('src') ?? ''
            if (!image) image = $(img).attr('data-src') ?? ''
            if (!image) throw new Error(`Unable to parse image(s) for Chapter ID: ${chapter.chapterId}`)
            pages.push(image)
        }

        const chapterDetails = {
            id: chapter.chapterId,
            mangaId: chapter.sourceManga.mangaId,
            pages: pages
        }

        return chapterDetails
    }

    parseTags = ($: CheerioAPI, source: MangaBox): TagSection[] => {
        const genres: Tag[] = []
        for (const genre of $(source.genreListSelector).toArray()) {
            const id = $(genre).attr('data-i')
            const title = $(genre).text().trim()
            if (!id || !title) continue
            genres.push({ id: id, title: title })
        }

        const TagSection: TagSection[] = [
            {
                id: '0',
                title: 'genres',
                tags: genres
            }
        ]
        return TagSection
    }

    parseDate = (date: string): Date => {
        let time: Date
        let number = Number((/\d*/.exec(date) ?? [])[0])
        number = (number == 0 && date.includes('a')) ? 1 : number
        date = date.toUpperCase()
        if (date.includes('MINUTE') || date.includes('MINUTES') || date.includes('MINS')) {
            time = new Date(Date.now() - (number * 60000))
        } else if (date.includes('HOUR') || date.includes('HOURS')) {
            time = new Date(Date.now() - (number * 3600000))
        } else if (date.includes('DAY') || date.includes('DAYS')) {
            time = new Date(Date.now() - (number * 86400000))
        } else if (date.includes('YEAR') || date.includes('YEARS')) {
            time = new Date(Date.now() - (number * 31556952000))
        } else {
            time = new Date(date)
        }

        return time
    }

    isLastPage = ($: CheerioAPI): boolean => {
        const currentPage = $('.page-select, .page_select').text()
        let totalPages = $('.page-last, .page_last').text()

        if (currentPage) {
            totalPages = (/(\d+)/g.exec(totalPages) ?? [''])[0]
            return (+totalPages) == (+currentPage)
        }

        return true
    }
}
