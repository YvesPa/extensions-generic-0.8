import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class MangaTXSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const MangaTX = new MangaTXSource()