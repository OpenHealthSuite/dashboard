export interface ITrainingPlanActivitySegment {
    order: number,
    details: string,
    durationSeconds: number
}

export interface ITrainingPlanActivity {
    id: string,
    trainingPlanId: string,
    name: string,
    activityTime: Date,
    segments: ITrainingPlanActivitySegment[],
    complete: boolean
}

export class TrainingPlanActivity implements ITrainingPlanActivity {
    id: string = '';
    trainingPlanId: string = '';
    name: string = '';
    activityTime: Date = new Date();
    segments: ITrainingPlanActivitySegment[] = [];
    complete: boolean = false;
}