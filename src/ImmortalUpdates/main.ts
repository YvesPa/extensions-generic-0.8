import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class ImmortalUpdatesSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const ImmortalUpdates = new ImmortalUpdatesSource()
