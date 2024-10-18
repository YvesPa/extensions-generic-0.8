import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class GourmetScansSource extends Madara {
    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override hasProtectedChapters = true

    override useListParameter = false
}

export const GourmetScans = new GourmetScansSource()
