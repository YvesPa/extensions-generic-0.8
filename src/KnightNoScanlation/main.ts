import { Madara } from '../Madara'
import { KnightNoScanlationParser } from './KnightNoScanlationParser'
import { DOMAIN } from './pbconfig'
class KnightNoScanlationSource extends Madara {

    baseUrl: string = DOMAIN

    override language = '🇪🇸'

    override chapterEndpoint = 1

    override parser: KnightNoScanlationParser = new KnightNoScanlationParser()
}

export const KnightNoScanlation = new KnightNoScanlationSource()