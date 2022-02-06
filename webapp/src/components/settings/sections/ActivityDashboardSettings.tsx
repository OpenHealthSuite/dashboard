import { Card, CardContent, CardHeader } from '@mui/material';
import { useEffect, useState } from 'react';
import { LoadingIndicator } from '../../shared/LoadingIndicator';
import { DEFAULT_DASHBOARD_SETTINGS, getSettings, IDashboardSettings, updateSettings } from '../../../services/SettingsService'

interface ActivityDashboardSettingsProps {
  fnGetSettings?: <T>(settingId: string) => Promise<T | undefined>,
  fnUpdateSettings?: <T>(settingId: string, settings: T) => Promise<void>
}

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
                  {dashboardSettings.tileSettings.map((s, i) => <li key={`key-${i}`}>{s.componentName}</li>)}
              </ul>
          </LoadingIndicator></CardContent>
  </Card>)
}