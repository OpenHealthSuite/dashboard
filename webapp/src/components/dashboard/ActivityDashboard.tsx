import { StepsGraphTile } from './tiles/StepsGraphTile'
import { CaloriesGraphTile } from './tiles/CaloriesGraphTile'
import { ActivitiesTile } from './tiles/ActivitiesTile'
import { CaloriesStepsDailyTile } from './tiles/CaloriesStepsDailyTile'
import { SleepDailyTile } from './tiles/SleepDailyTile'

import  { Grid, GridSize } from '@mui/material';

interface ITileSettings { 
    component: (props: any) => JSX.Element
}

interface IDashboardSettings { 
    spacing: number, 
    tileSizes: { 
        xs: GridSize, 
        sm: GridSize, 
        md: GridSize
    },
    tiles: ITileSettings[]
}


export default function ActivityDashboard() {
    const dashboardSettings: IDashboardSettings = {
        spacing: 2,
        tileSizes: {
            xs: 12,
            sm: 6,
            md: 4
        },
        tiles: [
            { component: ActivitiesTile },
            { component: CaloriesStepsDailyTile },
            { component: SleepDailyTile },
            { component: StepsGraphTile },
            { component: CaloriesGraphTile }
        ]
    }

    return (<Grid container spacing={dashboardSettings.spacing}>
        {dashboardSettings.tiles.map((tile, i) => { 
            return <Grid key={`gridkey-${i}`} item xs={dashboardSettings.tileSizes.xs} sm={dashboardSettings.tileSizes.sm} md={dashboardSettings.tileSizes.md}>
                <tile.component />
            </Grid> })}
        </Grid>
    )
}