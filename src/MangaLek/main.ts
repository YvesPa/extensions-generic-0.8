import { Madara } from '../Madara'
import { MangaLekParser } from './MangaLekParser'
import { DOMAIN } from './pbconfig'
class MangaLekSource extends Madara {

    baseUrl: string = DOMAIN

    override language = '🇦🇪'

    override chapterEndpoint = 1

    override bypassPage = `${DOMAIN}/?s=&post_type=wp-manga`

    override parser: MangaLekParser = new MangaLekParser()
}

export const MangaLek = new MangaLekSource()