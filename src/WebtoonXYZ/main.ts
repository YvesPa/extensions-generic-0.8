import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class WebtoonXYZSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const WebtoonXYZ = new WebtoonXYZSource()