import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class KunMangaSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const KunManga = new KunMangaSource()
