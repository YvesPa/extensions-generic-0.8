import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class DragonTeaSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}

export const DragonTea = new DragonTeaSource()
