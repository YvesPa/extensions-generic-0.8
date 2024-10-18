import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class ResetScansSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const ResetScans = new ResetScansSource()