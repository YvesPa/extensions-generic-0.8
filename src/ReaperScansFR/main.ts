import { Madara } from '../Madara'
import { Parser } from '../MadaraParser'
import { DOMAIN } from './pbconfig'
class ReaperScansFRSource extends Madara {

    baseUrl: string = DOMAIN

    override language = '🇫🇷'

    override chapterEndpoint = 1

    override parser: ReaperScansFRParser = new ReaperScansFRParser()
}

class ReaperScansFRParser extends Parser {
    override chapterListNameSelector  = 'a > p'
}

export const ReaperScansFR = new ReaperScansFRSource()