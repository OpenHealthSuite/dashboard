import { ITrainingPlanActivity } from '../models/ITrainingPlanActivity';
import { 
    pacemeGetRequest,
    pacemePostRequest,
    pacemePutRequest,
    pacemeBodylessDeleteRequest 
} from './BasePaceMeApiService';

const trainingPlanRoot = '/trainingplans'
const activitySlug = 'activities'

function parseDate(activity: ITrainingPlanActivity) : ITrainingPlanActivity {
    if (typeof activity.activityTime === 'string') {
        activity.activityTime = new Date(activity.activityTime)
    }
    return activity
}

export async function getActivity(planId: string, activityId: string): Promise<ITrainingPlanActivity | undefined> {
    const response = await pacemeGetRequest<ITrainingPlanActivity>([trainingPlanRoot, planId, activitySlug, activityId].join('/'))
    if (response === undefined) {
        return undefined
    }
    return parseDate(response)
}

export async function getActivities(planId: string): Promise<ITrainingPlanActivity[] | undefined> {
    const response = await pacemeGetRequest<ITrainingPlanActivity[]>([trainingPlanRoot, planId, activitySlug].join('/'))
    if (response === undefined) {
        return undefined
    }
    return response.map(parseDate)
}

export async function createNewActivity(planId: string, newActivity: ITrainingPlanActivity): Promise<string | undefined> {
    return await pacemePostRequest<ITrainingPlanActivity, string>([trainingPlanRoot, planId, activitySlug].join('/'), newActivity)
}

export async function editActivity(editedActivity: ITrainingPlanActivity): Promise<void> {
    await pacemePutRequest([trainingPlanRoot, editedActivity.trainingPlanId, activitySlug, editedActivity.id].join('/'), editedActivity)
}

export async function deleteActivity(planId: string, activityId: string): Promise<void> {
    await pacemeBodylessDeleteRequest([trainingPlanRoot, planId, activitySlug, activityId].join('/'))
}
