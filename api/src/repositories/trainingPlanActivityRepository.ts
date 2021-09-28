import { BaseDynamoPartitionSortRepository } from "./baseDynamoPartitionSortRepository";
import { v4 as uuidv4 } from 'uuid';

export interface ITrainingPlanActivitySegment {
    order: number,
    details: string,
    durationSeconds: number
}

export interface ITrainingPlanActivity {
    id : string,
    trainingPlanId: string,
    name: string,
    activityTime: Date,
    segments: ITrainingPlanActivitySegment[],
    complete: boolean
}

export class TrainingPlanActivityRepository extends BaseDynamoPartitionSortRepository<ITrainingPlanActivity> {
    constructor() {
        super(
            process.env.TRAINING_PLAN_ACTIVITY_TABLE ?? "TrainingPlanActivity",
            "trainingPlanId",
            "id",
            {
                "#nm": "name",
                "#acttime": "activityTime",
                "#segments": "segments",
                "#complete": "complete"
            }
        )
    }

    public async getTrainingPlanActivitiesForTrainingPlan (planId: string): Promise<ITrainingPlanActivity[]> {
        return await this.getAllByPartitionKey(planId);
    }

    public async getTrainingPlanActivity (planId: string, activityId: string): Promise<ITrainingPlanActivity> {
        return await this.getByPartitionAndSortKeys(planId, activityId);   
    }

    public async createTrainingPlanActivity (planId: string, newItem: ITrainingPlanActivity): Promise<ITrainingPlanActivity> {
        const newTableItem: ITrainingPlanActivity = { 
            id : uuidv4(),
            trainingPlanId: planId,
            name: newItem.name,
            activityTime: newItem.activityTime,
            segments: newItem.segments,
            complete: newItem.complete
        }
        return await this.create(newTableItem);
    }

    public async updateTrainingPlanActivity(itemUpdate: ITrainingPlanActivity): Promise<void> {
        return await this.update(itemUpdate);
    }

    public async deleteTrainingPlanActivity(planId: string, activityId: string): Promise<void> {
        return await this.deleteByPartitionAndSortKey(planId, activityId)
    }
}