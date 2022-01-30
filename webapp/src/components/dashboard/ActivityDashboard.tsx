import React, { ReactNode } from 'react';
import { LoadingIndicator } from '../shared/LoadingIndicator'
import { ITrainingPlanActivity } from '../../models/ITrainingPlanActivity'
import { getUserPlans } from '../../services/TrainingPlanService'
import { getActivities, editActivity } from '../../services/TrainingPlanActivityService'
import { ITrainingPlan } from '../../models/ITrainingPlan';
import { getTodaysSteps, getTodaysCalories, ISleep, getTodaySleep, IDatedSteps, getDateRangeSteps, IDatedCaloriesInOut, getDateRangeCalories } from '../../services/StatsService'

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
    stepCount: number,
    caloriesIn: number,
    caloriesOut: number,
    sleep: ISleep,
    lastWeekSteps: IDatedSteps[],
    lastWeekCalories: IDatedCaloriesInOut[]
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
            stepCount: 0,
            caloriesIn: 0,
            caloriesOut: 0,
            sleep: { rem: 0, asleep: 0, awake: 0 },
            lastWeekSteps: [],
            lastWeekCalories: []
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
        const calories = await getTodaysCalories()
        const sleep = await getTodaySleep()
        const yesterDate = new Date()
        yesterDate.setDate(yesterDate.getDate() - 1)
        const lastWeekDate = new Date()
        lastWeekDate.setDate(lastWeekDate.getDate() - 8)
        const lastWeekSteps = await getDateRangeSteps(lastWeekDate, yesterDate)
        const lastWeekCalories = await getDateRangeCalories(lastWeekDate, yesterDate)
        this.setState({
            loading: false,
            activePlans: plans,
            pendingActivities: pendingActivities,
            stepCount: stepCount.count,
            caloriesIn: calories.caloriesIn,
            caloriesOut: calories.caloriesOut,
            sleep: sleep,
            lastWeekSteps: lastWeekSteps,
            lastWeekCalories: lastWeekCalories
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
                <Grid item xs={4}>
                    <DashboardTile>
                        <h1>Calories</h1>
                        <div>
                            <h2>{this.state.caloriesIn}</h2>
                            <h2>{this.state.caloriesOut}</h2>
                        </div>
                    </DashboardTile>
                </Grid>
                <Grid item xs={4}>
                    <DashboardTile>
                        <h1>Steps</h1>
                        <div>
                            <h2>{this.state.stepCount}</h2>
                        </div>
                    </DashboardTile>
                </Grid>
                <Grid item xs={4}>
                    <DashboardTile>
                        <h1>Sleep</h1>
                        <div>
                            <h2>Asleep: {this.state.sleep.asleep}</h2>
                            <h2>REM: {this.state.sleep.rem}</h2>
                            <h4>Awake: {this.state.sleep.awake}</h4>
                        </div>
                    </DashboardTile>
                </Grid>
                <Grid item xs={4}>
                    <DashboardTile>
                    <h1>Activities</h1>
                    {this.state.pendingActivities.map((x, i) => 
                        <div key={`pendact-${i}`}>
                            <h2>{x.activityTime.toISOString().split('T')[0]}</h2>
                            <h3>{x.name}</h3>
                            <div>
                                <Button component={Link} to={"/trainingplans/"+x.trainingPlanId+"/activities/"+x.id}>View</Button>
                                <Button disabled={!dayIsToday(x.activityTime)} onClick={async () => { await this.markActivityComplete(x) }}>Mark Complete</Button>
                            </div>
                        </div>
                    )}
                    </DashboardTile>
                </Grid>
                <Grid item xs={4}>
                    <DashboardTile>
                        <h1>Last Week Steps</h1>
                        <div>
                            <ul>
                                {this.state.lastWeekSteps.map((x, i) => 
                                    <li key={`steps-${i}`}>
                                        {new Date(x.date).toISOString().split('T')[0]}: {x.steps}
                                    </li>
                                )}
                            </ul>
                        </div>
                    </DashboardTile>
                </Grid>
                <Grid item xs={4}>
                    <DashboardTile>
                        <h1>Last Week Calories</h1>
                        <div>
                            <ul>
                                {this.state.lastWeekCalories.map((x, i) => 
                                    <li key={`calories-${i}`}>
                                        {new Date(x.date).toISOString().split('T')[0]}: {x.caloriesIn} - {x.caloriesOut} 
                                    </li>
                                )}
                            </ul>
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