import { StepsGraphTile } from './tiles/StepsGraphTile'
import { CaloriesGraphTile } from './tiles/CaloriesGraphTile'
import { ActivitiesTile } from './tiles/ActivitiesTile'
import { CaloriesStepsDailyTile } from './tiles/CaloriesStepsDailyTile'
import { SleepDailyTile } from './tiles/SleepDailyTile'
import { getSettings, updateSettings } from '../../services/SettingsService'
import { Grid, GridSize } from '@mui/material';
import { useEffect, useState } from 'react'
import { LoadingIndicator } from '../shared/LoadingIndicator'

interface ITileSettings { 
    componentName: string
}

interface IDashboardSettings { 
    spacing: number, 
    tileSizes: { 
        xs: GridSize, 
        sm: GridSize, 
        md: GridSize
    },
    tileSettings: ITileSettings[]
}

interface IComponentLookup {
    [x: string]: (props: any) => JSX.Element
}

const ComponentLookup: IComponentLookup = {
    'ActivitiesTile': ActivitiesTile,
    'CaloriesStepsDailyTile': CaloriesStepsDailyTile,
    'SleepDailyTile': SleepDailyTile,
    'StepsGraphTile': StepsGraphTile,
    'CaloriesGraphTile': CaloriesGraphTile
}

const DEFAULT_SETTINGS: IDashboardSettings = {
    spacing: 2,
    tileSizes: {
        xs: 12,
        sm: 6,
        md: 4
    },
    tileSettings: [
        { componentName: 'ActivitiesTile' },
        { componentName: 'CaloriesStepsDailyTile' },
        { componentName: 'SleepDailyTile' },
        { componentName: 'StepsGraphTile' },
        { componentName: 'CaloriesGraphTile' }
    ]
}

interface DashboardProps {
    fnGetSettings?: <T>(settingId: string) => Promise<T | undefined>,
    fnUpdateSettings?: <T>(settingId: string, settings: T) => Promise<void>,
  }

function generateContent(settings: IDashboardSettings | undefined): JSX.Element {
    if (!settings) { return <></> }
    return <Grid container spacing={settings.spacing}>
        {settings.tileSettings.map(ts => { return { tileFunction: ComponentLookup[ts.componentName] } } ).map((tile, i) => { 
            return <Grid key={`gridkey-${i}`} item xs={settings.tileSizes.xs} sm={settings.tileSizes.sm} md={settings.tileSizes.md}>
                    <tile.tileFunction />
                </Grid>})
        }
    </Grid>
}

export default function ActivityDashboard({ fnGetSettings = getSettings, fnUpdateSettings = updateSettings }: DashboardProps) {
    const [dashboardSettings, setDashboardSettings] = useState<IDashboardSettings | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        const getSettings = async () => {
          const userSettings = await fnGetSettings<IDashboardSettings>("dashboard")
          if (!userSettings){
            fnUpdateSettings("dashboard", DEFAULT_SETTINGS)
          }
          const currentSettings = (userSettings || DEFAULT_SETTINGS)
          setDashboardSettings(currentSettings)
          setIsLoading(false)
        }
        getSettings()
      }, [fnGetSettings, fnUpdateSettings, setIsLoading, setDashboardSettings])
    return (
        <LoadingIndicator loading={isLoading}>
            {generateContent(dashboardSettings)}
        </LoadingIndicator>
    )
}