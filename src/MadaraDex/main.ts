import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class MadaraDexSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override searchMangaSelector = 'div.c-tabs-item > div.row'
}

export const MadaraDex = new MadaraDexSource()
