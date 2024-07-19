import { Form } from '@paperback/types'

export class MadaraSettingForm extends Form
{
    override getSections(): Application.FormSectionElement[] {
        return []
    }

    /*
    return App.createDUISection({
        id: 'sourceMenu',
        header: 'Source Menu',
        isHidden: false,
        rows: async () => [
            this.sourceSettings(this.stateManager)
        ]
    })

    
    sourceSettings = (stateManager: SourceStateManager): DUINavigationButton => {
        return App.createDUINavigationButton({
            id: 'madara_settings',
            label: 'Source Settings',
            form: App.createDUIForm({
                sections: async () => [
                    App.createDUISection({
                        id: 'hq_thumb',
                        isHidden: false,
                        footer: 'Enabling HQ thumbnails will use more bandwidth and will load thumbnails slightly slower.',
                        rows: async () => [
                            App.createDUISwitch({
                                id: 'HQthumb',
                                label: 'HQ Thumbnails',
                                value: App.createDUIBinding({
                                    get: async () => await stateManager.retrieve('HQthumb') ?? false,
                                    set: async (newValue) => await stateManager.store('HQthumb', newValue)
                                })
                            })
                        ]
                    })
                ]
            })
        })
    }*/

}