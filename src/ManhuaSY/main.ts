import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class ManhuaSYSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override hasProtectedChapters = true

    override usePostIds = false

    override directoryPath = 'manhua'
}

export const ManhuaSY = new ManhuaSYSource()