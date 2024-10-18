import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class AstralLibrarySource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const AstralLibrary = new AstralLibrarySource()
