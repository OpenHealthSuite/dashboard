export interface ITrainingPlan {
    id : string,
    userId: string,
    name: string,
    active: boolean
}

export class TrainingPlan implements ITrainingPlan {
    id: string = '';
    userId: string = '';
    name: string = '';
    active: boolean = false;
}