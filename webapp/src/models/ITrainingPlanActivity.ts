export interface ITrainingPlanActivitySegmentIntervals {
    order: number,
    note: string,
    durationSeconds: number
}

export interface ITrainingPlanActivitySegment {
    order: number,
    details: string,
    repetitions: number,
    intervals: ITrainingPlanActivitySegmentIntervals[]
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
    constructor(activityTime: Date) {
        this.activityTime = activityTime
    }
}