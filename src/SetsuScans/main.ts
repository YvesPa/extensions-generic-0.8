import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class SetsuScansSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const SetsuScans = new SetsuScansSource()
