import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class MangaBobSource extends Madara {

    baseUrl: string = DOMAIN
}

export const MangaBob = new MangaBobSource()
