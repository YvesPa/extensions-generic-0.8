import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class Manga3SSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const Manga3S = new Manga3SSource()
