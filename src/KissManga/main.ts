import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class KissMangaSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override usePostIds = true
}

export const KissManga = new KissMangaSource()

