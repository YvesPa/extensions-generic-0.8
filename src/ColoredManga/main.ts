import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class ColoredMangaSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const ColoredManga = new ColoredMangaSource()
