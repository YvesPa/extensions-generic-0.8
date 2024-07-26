import { MangaBox } from '../MangaBox'
import { SITE_DOMAIN } from './pbconfig'

class ManganatoSource extends MangaBox {
    // Website base URL.
    baseURL = SITE_DOMAIN

    // Language code supported by the source.
    languageCode = '🇬🇧'

    // Path for manga list.
    mangaListPath = 'genre-all'

    // Selector for manga in manga list.
    mangaListSelector = 'div.panel-content-genres div.content-genres-item'

    // Selector for subtitle in manga list.
    mangaSubtitleSelector = 'a.genres-item-chap.text-nowrap'
}


export const Manganato = new ManganatoSource()

