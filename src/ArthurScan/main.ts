import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class ArthurScanSource extends Madara {

    baseUrl: string = DOMAIN

    override language = '🇵🇹'

    override chapterEndpoint = 1
}

export const ArthurScan = new ArthurScanSource()
