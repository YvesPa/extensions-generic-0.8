import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class ManhwaTopSource extends Madara {

    baseUrl: string = DOMAIN
}

export const ManhwaTop = new ManhwaTopSource()
