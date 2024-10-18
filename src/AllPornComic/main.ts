import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class AllPornComicSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const AllPornComic = new AllPornComicSource()
