import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class MangaClashSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const MangaClash = new MangaClashSource()
