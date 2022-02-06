import { Grid } from '@mui/material';
import ProviderSettings from './sections/ProviderSettings'
import ActivityDashboardSettings from './sections/ActivityDashboardSettings'

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
