import * as baseDynamoRepo from './baseDynamoPartitionRepository'
import { randomUUID } from 'crypto'

export interface ITrainingPlan {
    id : string,
    userId: string,
    name: string,
    active: boolean
}

export class TrainingPlanRepository {
  private expressionAttributes = {
    '#nm': 'name',
    '#active': 'active'
  }

  public async getTrainingPlansForUser (userId: string): Promise<ITrainingPlan[]> {
    return await baseDynamoRepo.getAllByPartitionKey<ITrainingPlan>(process.env.TRAINING_PLAN_TABLE ?? 'TrainingPlan', 'userId', 'id', userId, this.expressionAttributes)
  }

  public async getTrainingPlan (userId: string, planId: string): Promise<ITrainingPlan> {
    return await baseDynamoRepo.getByPartitionAndSortKeys<ITrainingPlan>(process.env.TRAINING_PLAN_TABLE ?? 'TrainingPlan', 'userId', userId, 'id', planId)
  }

  public async createTrainingPlan (userId: string, newItem: ITrainingPlan): Promise<ITrainingPlan> {
    const newTableItem: ITrainingPlan = {
      id: randomUUID(),
      userId: userId,
      name: newItem.name,
      active: newItem.active
    }
    return await baseDynamoRepo.create(process.env.TRAINING_PLAN_TABLE ?? 'TrainingPlan', newTableItem)
  }

  public async updateTrainingPlan (itemUpdate: ITrainingPlan): Promise<void> {
    return await baseDynamoRepo.update(process.env.TRAINING_PLAN_TABLE ?? 'TrainingPlan', itemUpdate)
  }

  public async deleteTrainingPlan (userId: string, planId: string): Promise<void> {
    return await baseDynamoRepo.deleteByPartitionAndSortKey(process.env.TRAINING_PLAN_TABLE ?? 'TrainingPlan', 'userId', userId, 'id', planId)
  }
}
