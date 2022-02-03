import React, { ReactNode } from 'react';
import { LoadingIndicator } from '../shared/LoadingIndicator'
import { ITrainingPlanActivity } from '../../models/ITrainingPlanActivity'
import { getUserPlans } from '../../services/TrainingPlanService'
import { getActivities, editActivity } from '../../services/TrainingPlanActivityService'
import { ITrainingPlan } from '../../models/ITrainingPlan';
import { getTodaysSteps, getTodaysCalories, ISleep, getTodaySleep, IDatedSteps, getDateRangeSteps, IDatedCaloriesInOut, getDateRangeCalories } from '../../services/StatsService'

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { CardHeader } from '@mui/material';

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
    headerText?: string,
    children: ReactNode
}

function DashboardTile(props: IDashboardTileProps) {
    const cardHeader = props.headerText ? <CardHeader title={props.headerText}/> : null
    return (<Card>
        {cardHeader}
        <CardContent>
            {props.children}
        </CardContent>
    </Card>)
}

const dayLabels = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"
]

const colors = {
    caloriesIn: "#3A3",
    caloriesOut: "#A33",
    steps: "#44C"
}

function CaloriesGraphTile( props: { caloriesArray: IDatedCaloriesInOut[] }) {
    const caloriesInTotal= props.caloriesArray.map(x => x.caloriesIn - 0).reduce((partial, a) => a + partial, 0)
    const caloriesOutTotal= props.caloriesArray.map(x => x.caloriesOut - 0).reduce((partial, a) => a + partial, 0)
    const caloriesDelta= caloriesInTotal - caloriesOutTotal
    const caloriesString = `In: ${caloriesInTotal.toLocaleString()}  |  Out: ${caloriesOutTotal.toLocaleString()}  |  Delta: ${caloriesDelta.toLocaleString()}`
    return (<DashboardTile headerText='Last Week Calories'>
            <>
                <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                            
                            data={props.caloriesArray.map(x => { 
                                return { 
                                    dateLabel: dayLabels[new Date(x.date).getDay()],
                                    caloriesIn: x.caloriesIn,
                                    caloriesOut: x.caloriesOut
                                }})}
                            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                            >
                            <XAxis dataKey="dateLabel"/>
                            <YAxis orientation="right"/>
                            <Bar type="monotone" dataKey="caloriesIn" fill={colors.caloriesIn} yAxisId={0} />
                            <Bar type="monotone" dataKey="caloriesOut" fill={colors.caloriesOut} yAxisId={0} />
                        </BarChart>
                </ResponsiveContainer>
                <p style={{textAlign:"center"}}>{caloriesString}</p>
            </>
    </DashboardTile>)
}
function StepsGraphTile(props: { stepsArray: IDatedSteps[] }) {
    const totalSteps= props.stepsArray.map(x => x.steps - 0).reduce((partial, a) => a + partial, 0)
    return (<DashboardTile headerText='Last Week Steps'>
        <>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart
                    
                    data={props.stepsArray.map(x => { 
                        return { 
                            dateLabel: dayLabels[new Date(x.date).getDay()],
                            steps: x.steps
                        }})}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                    <XAxis dataKey="dateLabel"/>
                    <YAxis orientation="right"/>
                    <Bar type="monotone" dataKey="steps" fill={colors.steps} yAxisId={0} />
                </BarChart>
            </ResponsiveContainer>
            <p style={{textAlign:"center"}}>{totalSteps.toLocaleString()} Total Steps | {Math.floor(totalSteps / props.stepsArray.length).toLocaleString()} Avg.</p>
        </>
    </DashboardTile>)
}

function formatMinutesToText(minutes: number, startString: string = ""): string {
    if (minutes === 0) {
        return startString
    }
    if (minutes < 60) {
        return `${startString} ${minutes} minutes`
    }
    const hours = Math.floor(minutes / 60)
    return formatMinutesToText(minutes - (hours * 60), `${hours} hours`)
}

export default class ActivityDashboard extends React.Component<{}, IDashboardState> {
    refreshInterval: number = 60 * 5 * 1000
    autoUpdate: NodeJS.Timer | undefined

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
        this.autoUpdate = undefined
        this.updateDash = this.updateDash.bind(this)
        this.markActivityComplete = this.markActivityComplete.bind(this)
    }
    
    componentDidMount(): void {
        this.updateDash()
        if (!this.autoUpdate) {
            this.autoUpdate = setInterval(this.updateDash, this.refreshInterval)
        }
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
        lastWeekDate.setDate(lastWeekDate.getDate() - 7)
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
        const todayCalorieDelta = (this.state.caloriesIn - this.state.caloriesOut)
        let content = <Grid container spacing={2}>
                <Grid item xs={4}>
                    <DashboardTile headerText='Today'>
                        <div style={{textAlign:"center"}}>
                            <h1>
                                <span style={{color: colors.caloriesIn}}>{this.state.caloriesIn.toLocaleString()} In</span> - <span style={{color: colors.caloriesOut}}>{this.state.caloriesOut.toLocaleString()} Out</span>
                            </h1>
                            <h2 style={{color: todayCalorieDelta < 0 ? colors.caloriesOut : colors.caloriesIn}}>{todayCalorieDelta.toLocaleString()} Calories Delta</h2>
                            <h2 style={{color: colors.steps}}>{this.state.stepCount.toLocaleString()} Steps</h2>
                        </div>
                    </DashboardTile>
                </Grid>
                <Grid item xs={4}>
                    <DashboardTile headerText='Sleep'>
                        <div style={{textAlign:"center"}}>
                            <h1>{formatMinutesToText(this.state.sleep.asleep)}</h1>
                            <h3>REM: {formatMinutesToText(this.state.sleep.rem)}</h3>
                            <h4>Awake: {formatMinutesToText(this.state.sleep.awake)}</h4>
                        </div>
                    </DashboardTile>
                </Grid>
                <Grid item xs={4}>
                    <DashboardTile headerText='Activities'>
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
                    <StepsGraphTile stepsArray={this.state.lastWeekSteps}/>
                </Grid>
                <Grid item xs={4}>
                    <CaloriesGraphTile caloriesArray={this.state.lastWeekCalories} />
                </Grid>
            </Grid>
        
        return (
            <LoadingIndicator loading={this.state.loading}>
                {content}
            </LoadingIndicator>
        )
    }
}