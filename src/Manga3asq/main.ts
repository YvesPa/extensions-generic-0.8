import { Madara } from '../Madara'
import { Manga3asqParser } from './Manga3asqParser'
import { DOMAIN } from './pbconfig'
class Manga3asqSource extends Madara {

    baseUrl: string = DOMAIN

    override language = '🇦🇪'

    override chapterEndpoint = 1

    override parser: Manga3asqParser = new Manga3asqParser()
}

export const Manga3asq = new Manga3asqSource()
