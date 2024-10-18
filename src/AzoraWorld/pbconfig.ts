import { 
    SourceIntents, 
    ContentRating 
} from '@paperback/types'
import { getExportVersion } from '../MadaraConfig'

export const DOMAIN = 'https://azoramoon.com'

export default {
    icon: 'icon.png',
    name: 'AzoraWorld',
    version: getExportVersion('0.0.0'),
    description: `Extension that pulls manga from ${DOMAIN}`,
    contentRating: ContentRating.MATURE,
    developers: [
        {
            name: 'Netsky',
            github: 'https://github.com/TheNetsky'
        }
    ],
    badges: [
        {
            label: 'Arabic',
            backgroundColor: '#808080', 
            textColor: '#FFFFFF'
        }
    ],
    capabilities: [
        SourceIntents.MANGA_CHAPTERS,
        SourceIntents.HOMEPAGE_SECTIONS,
        SourceIntents.SETTINGS_UI,
        SourceIntents.MANGA_SEARCH,
        SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
    ]
}