import { 
    pacemeGetRequest,
    pacemePutRequest
} from './BasePaceMeApiService';

import { GridSize } from '@mui/material';

export interface ITileSettings { 
    componentName: string
}

export interface IDashboardSettings { 
    spacing: number, 
    tileSizes: { 
        xs: GridSize, 
        sm: GridSize, 
        md: GridSize
    },
    tileSettings: ITileSettings[]
}


export const DEFAULT_DASHBOARD_SETTINGS: IDashboardSettings = {
    spacing: 2,
    tileSizes: {
        xs: 12,
        sm: 6,
        md: 4
    },
    tileSettings: [
        { componentName: 'CaloriesStepsDailyTile' },
        { componentName: 'SleepDailyTile' },
        { componentName: 'StepsGraphTile' },
        { componentName: 'CaloriesGraphTile' }
    ]
}

const settingsRoot = '/userSettings'

export async function getSettings<T>(settingId: string): Promise<T | undefined> {
    return await pacemeGetRequest<T>([settingsRoot, settingId].join('/'))
}

export async function updateSettings<T>(settingId: string, details: T): Promise<void> {
    await pacemePutRequest([settingsRoot, settingId].join('/'), details)
}