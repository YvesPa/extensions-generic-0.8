import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class LHTranslationSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const LHTranslation = new LHTranslationSource()