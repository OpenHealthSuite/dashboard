import { ITrainingPlan } from '../models/ITrainingPlan';
import { 
    pacemeGetRequest,
    pacemePostRequest,
    pacemePutRequest,
    pacemeBodylessDeleteRequest 
} from './BasePaceMeApiService';

const trainingPlanRoot = '/trainingplans'

export async function getPlan(planId: string): Promise<ITrainingPlan> {
    return await pacemeGetRequest<ITrainingPlan>([trainingPlanRoot, planId].join('/'))
}

export async function getUserPlans(): Promise<ITrainingPlan[]> {
    return await pacemeGetRequest<ITrainingPlan[]>(trainingPlanRoot)
}

export async function createNewPlan(newplan: ITrainingPlan): Promise<string> {
    return await pacemePostRequest<ITrainingPlan, string>(trainingPlanRoot, newplan)
}

export async function editPlan(editedPlan: ITrainingPlan): Promise<void> {
    await pacemePutRequest([trainingPlanRoot, editedPlan.id].join('/'), editedPlan)
}

export async function deletePlan(planId: string): Promise<void> {
    return await pacemeBodylessDeleteRequest([trainingPlanRoot, planId].join('/'))
}
