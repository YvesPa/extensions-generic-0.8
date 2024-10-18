import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class MangaScantradSource extends Madara {

    baseUrl: string = DOMAIN

    override language = '🇫🇷'

    override chapterEndpoint = 1
}

export const MangaScantrad = new MangaScantradSource()
