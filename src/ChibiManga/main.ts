import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class ChibiMangaSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const ChibiManga = new ChibiMangaSource()

