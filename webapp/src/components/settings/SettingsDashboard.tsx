import { Card, CardContent, CardHeader, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { getProviderStatuses, startChallenge, IProviderStatus } from '../../services/ProvidersService'
import { LoadingIndicator } from '../shared/LoadingIndicator';

export default function SettingsDashboard() {
    return (<Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
            <ProviderSettings />
        </Grid>
    </Grid>)
}

function ProviderSettings() {
    const [statuses, setStatuses] = useState<IProviderStatus[]>([]);
    const [loading, setLoading] = useState(true)

    const getStatuses = async () => {
        setLoading(false)
        // TODO: Graceful error handling with toast
        setStatuses((await getProviderStatuses()) || [])
    }

    useEffect(() => {
        if (loading) {
            getStatuses()
        }
    }, [loading])

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
