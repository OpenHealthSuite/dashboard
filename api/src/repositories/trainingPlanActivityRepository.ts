import * as baseDynamoRepo from './baseDynamoPartitionRepository'
import { randomUUID } from 'crypto'

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
export class TrainingPlanActivityRepository {
  private expressionAttributes = {
    '#nm': 'name',
    '#acttime': 'activityTime',
    '#segments': 'segments',
    '#complete': 'complete'
  }

  public async getTrainingPlanActivitiesForTrainingPlan (planId: string): Promise<ITrainingPlanActivity[]> {
    return await baseDynamoRepo.getAllByPartitionKey(process.env.TRAINING_PLAN_ACTIVITY_TABLE ?? 'TrainingPlanActivity', 'trainingPlanId', 'id', planId, this.expressionAttributes)
  }

  public async getTrainingPlanActivity (planId: string, activityId: string): Promise<ITrainingPlanActivity> {
    return await baseDynamoRepo.getByPartitionAndSortKeys(process.env.TRAINING_PLAN_ACTIVITY_TABLE ?? 'TrainingPlanActivity', 'trainingPlanId', planId, 'id', activityId)
  }

  public async createTrainingPlanActivity (planId: string, newItem: ITrainingPlanActivity): Promise<ITrainingPlanActivity> {
    const newTableItem: ITrainingPlanActivity = {
      id: randomUUID(),
      trainingPlanId: planId,
      name: newItem.name,
      activityTime: newItem.activityTime,
      segments: newItem.segments,
      complete: newItem.complete
    }
    return await baseDynamoRepo.create(process.env.TRAINING_PLAN_ACTIVITY_TABLE ?? 'TrainingPlanActivity', newTableItem)
  }

  public async updateTrainingPlanActivity (itemUpdate: ITrainingPlanActivity): Promise<void> {
    return await baseDynamoRepo.update(process.env.TRAINING_PLAN_ACTIVITY_TABLE ?? 'TrainingPlanActivity', itemUpdate)
  }

  public async deleteTrainingPlanActivity (planId: string, activityId: string): Promise<void> {
    return await baseDynamoRepo.deleteByPartitionAndSortKey(process.env.TRAINING_PLAN_ACTIVITY_TABLE ?? 'TrainingPlanActivity', 'trainingPlanId', planId, 'id', activityId)
  }
}
