import React from 'react';
import { ITrainingPlanActivity } from '../../models/ITrainingPlanActivity'
import { getUserPlans } from '../../services/TrainingPlanService'
import { getActivities } from '../../services/TrainingPlanActivityService'
import { ITrainingPlan } from '../../models/ITrainingPlan';

interface IDashboardState {
    loading: boolean,
    activePlans: ITrainingPlan[],
    pendingActivities: ITrainingPlanActivity[]
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

export default class ActivityDashboard extends React.Component<{}, IDashboardState> {
    constructor(props: {}) {
        super(props)
        this.state = {
            loading: true,
            activePlans: [],
            pendingActivities: []
        }
    }
    
    componentDidMount(): void {
        this.updateDash()
    }

    async updateDash() {
        const plans = (await getUserPlans()).filter(x => x.active)
        const pendingActivities = await this.getNextActivities(plans)
        this.setState({
            loading: false,
            activePlans: plans,
            pendingActivities: pendingActivities
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

    render(): React.ReactNode {
        let content = <div>Loading...</div>
        if (!this.state.loading && this.state.pendingActivities.length > 0) {
            content = <ul>
                {this.state.pendingActivities.map((x, i) => <li key={`pendact-${i}`}>{x.activityTime.toISOString().split('T')[0]}: {x.name}</li>)}
            </ul>
        } else if (!this.state.loading) {
            content = <div>No Activities Scheduled</div>
        }
        return (
            <>{content}</>
        )
    }
}