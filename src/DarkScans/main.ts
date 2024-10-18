import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class DarkScansSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const DarkScans = new DarkScansSource()