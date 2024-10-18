import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class CoffeeMangaSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const CoffeeManga = new CoffeeMangaSource()