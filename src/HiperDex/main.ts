import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class HiperDexSource extends Madara {

    baseUrl: string = DOMAIN
    override requestsPerSecond = 3
    override chapterEndpoint = 1
}

export const HiperDex = new HiperDexSource()
