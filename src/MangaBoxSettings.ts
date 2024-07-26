import { 
    Form, 
    Section, 
    SelectRow 
} from '@paperback/types'

export function getImageServer(): string {
    return (Application.getState('imageServer') as string) ?? 'server1'
}

export function setImageServer(value: string | undefined): void {
    Application.setState(value ?? 'server1', 'imageServer')
}

export class MangaBoxSettingForm extends Form
{
    override getSections(): Application.FormSectionElement[] {
        return [
            Section('Madara Settings', [
                SelectRow('imageServer', {
                    title: 'Image Server',
                    minItemCount: 1,
                    maxItemCount: 1,
                    value: [getImageServer()],
                    options: [
                        { id: 'server1', title: 'Server 1' },
                        { id: 'server2', title: 'Server 2' }
                    ],
                    onValueChange: Application.Selector(this as MangaBoxSettingForm, 'setImageServerChange')
                })
            ])
        ]
    }

    async setImageServerChange(value: string[]): Promise<void> {
        setImageServer(value[0])
    }
}