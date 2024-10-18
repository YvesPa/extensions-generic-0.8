import { DiscoverSectionType } from '@paperback/types'
import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
import { SamuraiScanParser } from './SamuraiScanParser'
class SamuraiScanSource extends Madara {

    baseUrl: string = DOMAIN

    override language = '🇪🇸'

    override chapterEndpoint = 1

    override parser: SamuraiScanParser = new SamuraiScanParser()

    override sections = [
        {
            id: 'id_1',
            title: 'Currently Trending',
            type: DiscoverSectionType.simpleCarousel
        },
        { 
            id: 'id_0',
            title: 'Recently Updated',
            type: DiscoverSectionType.simpleCarousel
        },
        {
            id: 'id_2',
            title: 'Most Popular',
            type: DiscoverSectionType.simpleCarousel
        }
    ]
}

export const SamuraiScan = new SamuraiScanSource()