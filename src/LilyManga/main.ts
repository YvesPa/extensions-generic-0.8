import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class LilyMangaSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const LilyManga = new LilyMangaSource()