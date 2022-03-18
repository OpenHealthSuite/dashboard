import { StepsGraphTile } from './tiles/StepsGraphTile'
import { CaloriesGraphTile } from './tiles/CaloriesGraphTile'
import { CaloriesStepsDailyTile } from './tiles/CaloriesStepsDailyTile'
import { SleepDailyTile } from './tiles/SleepDailyTile'
import { DEFAULT_DASHBOARD_SETTINGS, getSettings, IDashboardSettings, updateSettings } from '../../services/SettingsService'
import { Grid } from '@mui/material';
import { useEffect, useState } from 'react'
import { LoadingIndicator } from '../shared/LoadingIndicator'


export interface IComponentLookup {
    [x: string]: (props: any) => JSX.Element
}

const ComponentLookup: IComponentLookup = {
    'CaloriesStepsDailyTile': CaloriesStepsDailyTile,
    'SleepDailyTile': SleepDailyTile,
    'StepsGraphTile': StepsGraphTile,
    'CaloriesGraphTile': CaloriesGraphTile
}

interface DashboardProps {
    fnGetSettings?: <T>(settingId: string) => Promise<T | undefined>,
    fnUpdateSettings?: <T>(settingId: string, settings: T) => Promise<void>,
  }

function generateContent(settings: IDashboardSettings | undefined): JSX.Element {
    if (!settings) { return <></> }
    return <Grid container spacing={settings.spacing}>
        {settings.tileSettings.filter(ts => Object.keys(ComponentLookup).includes(ts.componentName)).map(ts => { return { tileFunction: ComponentLookup[ts.componentName] } } ).map((tile, i) => { 
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
            fnUpdateSettings("dashboard", DEFAULT_DASHBOARD_SETTINGS)
          }
          const currentSettings = (userSettings || DEFAULT_DASHBOARD_SETTINGS)
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