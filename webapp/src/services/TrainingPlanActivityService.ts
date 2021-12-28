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

export async function getActivity(planId: string, activityId: string): Promise<ITrainingPlanActivity> {
    return parseDate(await pacemeGetRequest<ITrainingPlanActivity>([trainingPlanRoot, planId, activitySlug, activityId].join('/')))
}

export async function getActivities(planId: string): Promise<ITrainingPlanActivity[]> {
    return (await pacemeGetRequest<ITrainingPlanActivity[]>([trainingPlanRoot, planId, activitySlug].join('/'))).map(parseDate)
}

export async function createNewActivity(planId: string, newActivity: ITrainingPlanActivity): Promise<string> {
    return await pacemePostRequest<ITrainingPlanActivity, string>([trainingPlanRoot, planId, activitySlug].join('/'), newActivity)
}

export async function editActivity(editedActivity: ITrainingPlanActivity): Promise<void> {
    await pacemePutRequest([trainingPlanRoot, editedActivity.trainingPlanId, activitySlug, editedActivity.id].join('/'), editedActivity)
}

export async function deleteActivity(planId: string, activityId: string): Promise<void> {
    return await pacemeBodylessDeleteRequest([trainingPlanRoot, planId, activitySlug, activityId].join('/'))
}
