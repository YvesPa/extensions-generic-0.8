import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class NovelMicSource extends Madara {

    baseUrl: string = DOMAIN
}

export const NovelMic = new NovelMicSource()