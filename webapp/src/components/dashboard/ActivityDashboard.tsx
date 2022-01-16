import React, { ReactNode } from 'react';
import { LoadingIndicator } from '../shared/LoadingIndicator'
import { ITrainingPlanActivity } from '../../models/ITrainingPlanActivity'
import { getUserPlans } from '../../services/TrainingPlanService'
import { getActivities, editActivity } from '../../services/TrainingPlanActivityService'
import { ITrainingPlan } from '../../models/ITrainingPlan';
import { getTodaysSteps } from '../../services/ActivityService'

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

interface IDashboardState {
    loading: boolean,
    activePlans: ITrainingPlan[],
    pendingActivities: ITrainingPlanActivity[],
    stepCount: number
}

function dayIsToday(date: Date): boolean {
    // TODO: Probably go find a library to do this
    return dateDaysMatch(date, new Date())
}

function dayIsTodayOrLater(date: Date): boolean {
    // TODO: Probably go find a library to do this
    const dateDate = date.toISOString().split('T')[0].split('-').map(x => parseInt(x))
    const todayDate = (new Date()).toISOString().split('T')[0].split('-').map(x => parseInt(x))
    return dateDate[0] >= todayDate[0] && dateDate[1] >= todayDate[1] && dateDate[2] >= todayDate[2]
}

function dateDaysMatch(dateOne: Date, dateTwo: Date): boolean {
    // TODO: Probably go find a library to do this
    const dateOneDate = dateOne.toISOString().split('T')[0]
    const dateTwoDate = dateTwo.toISOString().split('T')[0]
    return dateOneDate === dateTwoDate;
}

interface IDashboardTileProps {
    children: ReactNode
}

function DashboardTile(props: IDashboardTileProps) {
    return (<Card>
        <CardContent>
            <Typography>
                {props.children}
            </Typography>
        </CardContent>
    </Card>)
}

export default class ActivityDashboard extends React.Component<{}, IDashboardState> {
    constructor(props: {}) {
        super(props)
        this.state = {
            loading: true,
            activePlans: [],
            pendingActivities: [],
            stepCount: 0
        }
        this.updateDash = this.updateDash.bind(this)
        this.markActivityComplete = this.markActivityComplete.bind(this)
    }
    
    componentDidMount(): void {
        this.updateDash()
    }

    async updateDash() {
        const plans = (await getUserPlans()).filter(x => x.active)
        const pendingActivities = await this.getNextActivities(plans)
        const stepCount = await getTodaysSteps()
        this.setState({
            loading: false,
            activePlans: plans,
            pendingActivities: pendingActivities,
            stepCount: stepCount.count
        })
    }

    async getNextActivities(plans: ITrainingPlan[]): Promise<ITrainingPlanActivity[]> {
        const allActivePlanActivities = (await Promise.all(plans.map(async p => await getActivities(p.id)))).flat()
        if ( allActivePlanActivities.length === 0 ) { 
            return [] 
        }
        const comingActivites = allActivePlanActivities.filter(x => !x.complete && dayIsTodayOrLater(x.activityTime))
        if ( comingActivites.length === 0 ) { 
            return [] 
        }
        const nextActivityDate = comingActivites.sort((a, b) => new Date(a.activityTime).getTime() - new Date(b.activityTime).getTime())[0].activityTime
        return comingActivites.filter(x => dateDaysMatch(nextActivityDate, x.activityTime));
    }

    async markActivityComplete(activity: ITrainingPlanActivity) {
        activity.complete = true;
        this.setState({ loading: true })
        await editActivity(activity)
        await this.updateDash()
    }

    render(): React.ReactNode {

        let content = <Grid container spacing={2}>
                {this.state.pendingActivities.map((x, i) => 
                <Grid item key={`pendact-${i}`} xs={3}>
                    <DashboardTile>
                        <h2>{x.activityTime.toISOString().split('T')[0]}</h2>
                        <h3>{x.name}</h3>
                        <div>
                            <Button component={Link} to={"/trainingplans/"+x.trainingPlanId+"/activities/"+x.id}>View</Button>
                            <Button disabled={!dayIsToday(x.activityTime)} onClick={async () => { await this.markActivityComplete(x) }}>Mark Complete</Button>
                        </div>
                    </DashboardTile>
                </Grid>)}
                <Grid item xs={3}>
                    <DashboardTile>
                        <h2>Steps</h2>
                        <div>
                            <h4>{this.state.stepCount}</h4>
                        </div>
                    </DashboardTile>
                </Grid>
            </Grid>
        
        return (
            <LoadingIndicator loading={this.state.loading}>
                {content}
            </LoadingIndicator>
        )
    }
}