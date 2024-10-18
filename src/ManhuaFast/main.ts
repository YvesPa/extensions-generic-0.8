import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class ManhuaFastSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override bypassPage = `${DOMAIN}/?p`
}

export const ManhuaFast = new ManhuaFastSource()
