import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class PlatinumScansSource extends Madara {

    baseUrl: string = DOMAIN

    override hasAdvancedSearchPage = false
}

export const PlatinumScans = new PlatinumScansSource()
