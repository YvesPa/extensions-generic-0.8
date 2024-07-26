import { MangaBox } from '../MangaBox'
import { SITE_DOMAIN } from './pbconfig'

class MangaBatClass extends MangaBox {
    // Website base URL.
    baseURL = SITE_DOMAIN

    // Language code supported by the source.
    languageCode = '🇬🇧'

    // Path for manga list.
    mangaListPath = 'manga-list-all'

    // Selector for manga in manga list.
    mangaListSelector = 'div.panel-list-story div.list-story-item'

    // Selector for subtitle in manga list.
    mangaSubtitleSelector = 'div.item-right > a.item-chapter'
}

export const MangaBat = new MangaBatClass()

