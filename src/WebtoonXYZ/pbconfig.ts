import { 
    SourceIntents, 
    ContentRating 
} from '@paperback/types'
import { getExportVersion } from '../MadaraConfig'

export const DOMAIN = 'https://webtoonxyz.com'

export default {
    icon: 'icon.png',
    name: 'WebtoonXYZ',
    version: getExportVersion('0.0.0'),
    description: `Extension that pulls manga from ${DOMAIN}`,
    contentRating: ContentRating.ADULT,
    developers: [
        {
            name: 'Netsky',
            github: 'https://github.com/TheNetsky'
        }
    ],
    badges: [
        {
            label: '18+',
            backgroundColor: '#FFFF00', 
            textColor: '#000000'
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