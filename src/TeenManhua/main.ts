import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class TeenManhuaSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const TeenManhua = new TeenManhuaSource()
