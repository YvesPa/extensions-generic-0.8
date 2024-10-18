import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class LSComicSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const LSComic = new LSComicSource()

