import { Card, CardContent, CardHeader } from '@mui/material';
import { useEffect, useState } from 'react';
import { LoadingIndicator } from '../../shared/LoadingIndicator';
import { DEFAULT_DASHBOARD_SETTINGS, getSettings, IDashboardSettings, updateSettings } from '../../../services/SettingsService'

interface ActivityDashboardSettingsProps {
  fnGetSettings?: <T>(settingId: string) => Promise<T | undefined>,
  fnUpdateSettings?: <T>(settingId: string, settings: T) => Promise<void>
}

interface IAvailableTile {
  componentName: string,
  componentNiceName: string
}

const ALL_AVAILABLE_TILES: IAvailableTile[] = [
  { componentName: 'ActivitiesTile', componentNiceName: 'Activities' },
  { componentName: 'CaloriesStepsDailyTile', componentNiceName: 'Calories/Steps Daily Summary' },
  { componentName: 'SleepDailyTile', componentNiceName: 'Sleep Daily Summary' },
  { componentName: 'StepsGraphTile', componentNiceName: 'Steps Graph' },
  { componentName: 'CaloriesGraphTile', componentNiceName: 'Calories Graph' }
]

export default function ActivityDashboardSettings({fnGetSettings = getSettings, fnUpdateSettings = updateSettings}: ActivityDashboardSettingsProps) {
  const [dashboardSettings, setDashboardSettings] = useState<IDashboardSettings>(DEFAULT_DASHBOARD_SETTINGS)
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

  return (<Card>
      <CardHeader title={"Activity Dashboard Settings"} />
      <CardContent>
          <LoadingIndicator loading={isLoading}>
              <ul>
                  {ALL_AVAILABLE_TILES.map((at, i) => {
                    return <li key={`key-${i}`}>{at.componentNiceName} - {dashboardSettings.tileSettings.map(x => x.componentName).includes(at.componentName) ? 'Enabled': 'Disabled'}</li>
                  })}
              </ul>
          </LoadingIndicator></CardContent>
  </Card>)
}