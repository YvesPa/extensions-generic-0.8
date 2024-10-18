import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class PianMangaSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override usePostIds = false
}

export const PianManga = new PianMangaSource()