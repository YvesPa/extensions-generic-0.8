import { 
    DiscoverSection, 
    PagedResults, 
    SearchResultItem
} from '@paperback/types'
import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class ToonGodSource extends Madara {

    baseUrl: string = DOMAIN

    override directoryPath = 'webtoons'

    override chapterEndpoint = 2

    toonGodSectionParams : Record<string, {page: number, queryPram: string}> = {
        id_0: { page: 1, queryPram: 'm_orderby=latest' },
        id_1: { page: 1, queryPram: 'm_orderby=trending' },
        id_2: { page: 1, queryPram: 'm_orderby=views' },
        id_3: { page: 1, queryPram: 'm_orderby=new-manga' }
    };
    override async getDiscoverSectionTitles(section: DiscoverSection, metadata: any): Promise<PagedResults<SearchResultItem>> {
        const params = this.toonGodSectionParams[section.id]
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
}

export const ToonGod = new ToonGodSource()