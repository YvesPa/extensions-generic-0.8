import { Madara } from '../Madara'
import { DOMAIN } from './pbconfig'
class ManhuausSource extends Madara {

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override chapterDetailsSelector = 'li.blocks-gallery-item > figure > img, div.page-break > img, div#chapter-video-frame > p > img, div.text-left > figure.wp-block-gallery > figure.wp-block-image > img, div.text-left > p > img'

    override bypassPage = `${DOMAIN}/?p`
}

export const Manhuaus = new ManhuausSource()