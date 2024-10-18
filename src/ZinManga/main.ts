import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class ZinMangaSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override usePostIds = false
}

export const ZinManga = new ZinMangaSource()
