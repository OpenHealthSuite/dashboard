import { ITrainingPlan } from '../models/ITrainingPlan';
import { 
    pacemeGetRequest,
    pacemePostRequest,
    pacemePutRequest,
    pacemeBodylessDeleteRequest 
} from './BasePaceMeApiService';

const trainingPlanRoot = '/trainingplans'

export async function getPlan(planId: string): Promise<ITrainingPlan | undefined> {
    return await pacemeGetRequest<ITrainingPlan>([trainingPlanRoot, planId].join('/'))
}

export async function getUserPlans(): Promise<ITrainingPlan[] | undefined> {
    return await pacemeGetRequest<ITrainingPlan[]>(trainingPlanRoot)
}

export async function createNewPlan(newplan: ITrainingPlan): Promise<string | undefined> {
    return await pacemePostRequest<ITrainingPlan, string>(trainingPlanRoot, newplan)
}

export async function editPlan(editedPlan: ITrainingPlan): Promise<void> {
    await pacemePutRequest([trainingPlanRoot, editedPlan.id].join('/'), editedPlan)
}

export async function deletePlan(planId: string): Promise<void> {
    await pacemeBodylessDeleteRequest([trainingPlanRoot, planId].join('/'))
}
