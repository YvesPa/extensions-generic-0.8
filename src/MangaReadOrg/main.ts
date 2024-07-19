import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
import { MangaReadOrgParser } from './MangaReadOrgParser'

class MangaReadOrgSource extends Madara {
    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override parser: MangaReadOrgParser = new MangaReadOrgParser()
}

export const MangaReadOrg = new MangaReadOrgSource()