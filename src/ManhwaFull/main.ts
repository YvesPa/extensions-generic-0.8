import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class ManhwaFullSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const ManhwaFull = new ManhwaFullSource()
