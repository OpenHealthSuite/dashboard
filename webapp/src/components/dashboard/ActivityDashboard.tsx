import { StepsGraphTile } from './tiles/StepsGraphTile'
import { CaloriesGraphTile } from './tiles/CaloriesGraphTile'
import { ActivitiesTile } from './tiles/ActivitiesTile'
import { CaloriesStepsDailyTile } from './tiles/CaloriesStepsDailyTile'
import { SleepDailyTile } from './tiles/SleepDailyTile'

import Grid from '@mui/material/Grid';

export default function ActivityDashboard() {
    return (<Grid container spacing={2}>
        <Grid item xs={4}>
            <ActivitiesTile />
        </Grid>
        <Grid item xs={4}>
            <CaloriesStepsDailyTile />
        </Grid>
        <Grid item xs={4}>
            <SleepDailyTile />
        </Grid>
        <Grid item xs={4}>
            <StepsGraphTile />
        </Grid>
        <Grid item xs={4}>
            <CaloriesGraphTile />
        </Grid>
    </Grid>
    )
}