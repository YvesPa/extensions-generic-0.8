import { 
    Form, 
    LabelRow, 
    Section, 
    ToggleRow
} from '@paperback/types'

function toBoolean(value: any | undefined): boolean {
    return (value ?? false) === 'true'
}

export function getHQthumb(): boolean {
    return toBoolean(Application.getState('HQthumb'))
}

export function setHQthumb(value: boolean): void {
    Application.setState(value.toString(), 'HQthumb')
}

export class MadaraSettingForm extends Form
{
    override getSections(): Application.FormSectionElement[] {
        return [
            Section('Madara Settings', [
                ToggleRow('hq_thumb', {
                    title: 'HQ Thumbnails',
                    value: getHQthumb(),
                    onValueChange: Application.Selector(this as MadaraSettingForm, 'hQthumbChange')
                }),
                LabelRow('label',{
                    title: '',
                    subtitle: 'Enabling HQ thumbnails will use more bandwidth and will load thumbnails slightly slower.'
                })
            ])
        ]
    }

    async hQthumbChange(value: boolean): Promise<void> {
        setHQthumb(value)
    }
}