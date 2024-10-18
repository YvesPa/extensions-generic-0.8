import { 
    DiscoverSection,
    DiscoverSectionType,
    PagedResults,
    SearchResultItem
} from '@paperback/types'
import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class BibiMangaSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override usePostIds = false
    
    
    azoraWorldParserSectionParams : Record<string, {page: number, queryPram: string}> = {
        id_0: { page: 1, queryPram: 'm_orderby=latest' },
        id_2: { page: 1, queryPram: 'm_orderby=views' },
        id_3: { page: 1, queryPram: 'm_orderby=new-manga' }
    };
    override async getDiscoverSectionTitles(section: DiscoverSection, metadata: any): Promise<PagedResults<SearchResultItem>> {
        const params = this.azoraWorldParserSectionParams[section.id]
        if (!params) throw new Error('Invalid section id!')
        
        const page = metadata ? (metadata.page ?? 0 ) : params.page

        const request = {
            url: `${this.baseUrl}/${this.directoryPath}/page/${page}/?${params.queryPram}`,
            method: 'GET'
        }

        const [response, data] = await Application.scheduleRequest(request)
        await this.checkResponseError(response, request)
        const $ = this.cheerio.load(Application.arrayBufferToUTF8String(data))
        const results = await this.parser.parseDiscoverSection($, this)
        return {
            items: results,
            metadata: metadata || results.length < 50 ? undefined : { page: (page + 1) }
        }
    }

    override sections = [
        { 
            id: 'id_0',
            title: 'Recently Updated',
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
}

export const BibiManga = new BibiMangaSource()