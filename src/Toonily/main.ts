import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class ToonilySource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override searchMangaSelector = 'div.page-item-detail.manga'
}

export const Toonily = new ToonilySource()