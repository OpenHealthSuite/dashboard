import { StepsGraphTile } from './tiles/StepsGraphTile'
import { CaloriesGraphTile } from './tiles/CaloriesGraphTile'
import { ActivitiesTile } from './tiles/ActivitiesTile'
import { CaloriesStepsDailyTile } from './tiles/CaloriesStepsDailyTile'
import { SleepDailyTile } from './tiles/SleepDailyTile'

import  { Grid, GridSize } from '@mui/material';

interface DashboardSettings { 
    spacing: number, 
    tileSizes: { 
        xs: GridSize, 
        sm: GridSize, 
        md: GridSize
    }
}

export default function ActivityDashboard() {
    const dashboardSettings: DashboardSettings = {
        spacing: 2,
        tileSizes: {
            xs: 12,
            sm: 6,
            md: 4
        }
    }
    return (<Grid container spacing={dashboardSettings.spacing}>
        <Grid item xs={dashboardSettings.tileSizes.xs} sm={dashboardSettings.tileSizes.sm} md={dashboardSettings.tileSizes.md}>
            <ActivitiesTile />
        </Grid>
        <Grid item xs={dashboardSettings.tileSizes.xs} sm={dashboardSettings.tileSizes.sm} md={dashboardSettings.tileSizes.md}>
            <CaloriesStepsDailyTile />
        </Grid>
        <Grid item xs={dashboardSettings.tileSizes.xs} sm={dashboardSettings.tileSizes.sm} md={dashboardSettings.tileSizes.md}>
            <SleepDailyTile />
        </Grid>
        <Grid item xs={dashboardSettings.tileSizes.xs} sm={dashboardSettings.tileSizes.sm} md={dashboardSettings.tileSizes.md}>
            <StepsGraphTile />
        </Grid>
        <Grid item xs={dashboardSettings.tileSizes.xs} sm={dashboardSettings.tileSizes.sm} md={dashboardSettings.tileSizes.md}>
            <CaloriesGraphTile />
        </Grid>
    </Grid>
    )
}