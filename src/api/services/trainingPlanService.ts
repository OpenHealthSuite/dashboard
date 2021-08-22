import { v4 as uuidv4 } from 'uuid'

export interface TrainingPlan {
    userId: string,
    id: string,
    name: string
}

// TODO: This needs to go to dynamodb, not just be in memory, obv.
const trainingPlans: TrainingPlan[] = []

export function getTrainingPlansForUser(userId: string): TrainingPlan[] {
    return trainingPlans.filter(x => x.userId === userId)
}

export function getTrainingPlansForUserById(userId: string, trainingPlanId: string): TrainingPlan {
    return trainingPlans.find(x => x.userId === userId && x.id === trainingPlanId)
}


export function createTrainingPlanForUser(userId: string, trainingPlan: TrainingPlan): string {
    trainingPlan.id = uuidv4()
    trainingPlan.userId = userId
    trainingPlans.push(trainingPlan)
    return trainingPlan.id
}

export function updateTrainingPlansForUserById(userId: string, trainingPlanId: string, trainingPlan: TrainingPlan): void {
    const index = trainingPlans.findIndex(x => x.userId === userId && x.id === trainingPlanId)
    if( index > -1){
        trainingPlans[index].name = trainingPlan.name;
    }
}
