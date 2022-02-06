import { 
    pacemeGetRequest,
    pacemePutRequest
} from './BasePaceMeApiService';

const settingsRoot = '/userSettings'

export async function getSettings<T>(settingId: string): Promise<T | undefined> {
    return await pacemeGetRequest<T>([settingsRoot, settingId].join('/'))
}

export async function updateSettings<T>(settingId: string, details: T): Promise<void> {
    await pacemePutRequest([settingsRoot, settingId].join('/'), details)
}