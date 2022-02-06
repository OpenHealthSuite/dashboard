import { Card, CardContent, CardHeader, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { getProviderStatuses, startChallenge, IProviderStatus } from '../../services/ProvidersService'
import { LoadingIndicator } from '../shared/LoadingIndicator';
import { DEFAULT_DASHBOARD_SETTINGS, getSettings, IDashboardSettings, updateSettings } from '../../services/SettingsService'


export default function SettingsDashboard() {
    return (<Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
            <ProviderSettings />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
            <ActivityDashboardSettings />
        </Grid>
    </Grid>)
}

interface ActivityDashboardSettingsProps {
    fnGetSettings?: <T>(settingId: string) => Promise<T | undefined>,
    fnUpdateSettings?: <T>(settingId: string, settings: T) => Promise<void>
}

function ActivityDashboardSettings({fnGetSettings = getSettings, fnUpdateSettings = updateSettings}: ActivityDashboardSettingsProps) {
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

function ProviderSettings() {
    const [statuses, setStatuses] = useState<IProviderStatus[]>([]);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getStatuses = async () => {
            // TODO: Graceful error handling with toast
            setStatuses((await getProviderStatuses()) || [])
            setLoading(false)
        }
        getStatuses()
    }, [setLoading, setStatuses])

    return (<Card>
        <CardHeader title={"Data Providers"} />
        <CardContent>
            <LoadingIndicator loading={loading}>
                <ul>
                    {statuses.map(s => <li key={s.key}>{s.name} - {s.authenticated ? 'Authed' : 'Unauthed'}: <button onClick={() => GetChallenge(s.key)}>Authenticate</button></li>)}
                </ul>
            </LoadingIndicator></CardContent>
    </Card>)
}

async function GetChallenge(key: string) {
    // Send post to api.address/users/:userId/providers/:key/start to get URL w/ challenge
    // Send user to retreived URL
    const { authUrl } = await startChallenge(key)

    window.location.href = authUrl
}
