import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class HuntMangaSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const HuntManga = new HuntMangaSource()
