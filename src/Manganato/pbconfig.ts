import { 
    SourceIntents, 
    ContentRating 
} from '@paperback/types'
import { getExportVersion } from '../MangaBoxConfig'

export const SITE_DOMAIN = 'https://manganato.com'

export default {
    icon: 'icon.png',
    name: 'Manganato',
    version: getExportVersion('0.0.0'),
    description: `Extension that pulls manga from ${SITE_DOMAIN}`,
    contentRating: ContentRating.ADULT,
    developers: [
        {
            name: 'Batmeow',
            github: 'https://github.com/Batmeow'
        }
    ],
    badges: [],
    capabilities: [
        SourceIntents.MANGA_CHAPTERS,
        SourceIntents.HOMEPAGE_SECTIONS,
        SourceIntents.SETTINGS_UI,
        SourceIntents.MANGA_SEARCH
    ]
}