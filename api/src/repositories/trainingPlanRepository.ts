import { BaseDynamoPartitionSortRepository } from './baseDynamoPartitionSortRepository'
import { randomUUID } from 'crypto'

export interface ITrainingPlan {
    id : string,
    userId: string,
    name: string,
    active: boolean
}

export class TrainingPlanRepository extends BaseDynamoPartitionSortRepository<ITrainingPlan> {
  constructor () {
    super(
      process.env.TRAINING_PLAN_TABLE ?? 'TrainingPlan',
      'userId',
      'id',
      {
        '#nm': 'name',
        '#active': 'active'
      }
    )
  }

  public async getTrainingPlansForUser (userId: string): Promise<ITrainingPlan[]> {
    return await this.getAllByPartitionKey(userId)
  }

  public async getTrainingPlan (userId: string, planId: string): Promise<ITrainingPlan> {
    return await this.getByPartitionAndSortKeys(userId, planId)
  }

  public async createTrainingPlan (userId: string, newItem: ITrainingPlan): Promise<ITrainingPlan> {
    const newTableItem: ITrainingPlan = {
      id: randomUUID(),
      userId: userId,
      name: newItem.name,
      active: newItem.active
    }
    return await this.create(newTableItem)
  }

  public async updateTrainingPlan (itemUpdate: ITrainingPlan): Promise<void> {
    return await this.update(itemUpdate)
  }

  public async deleteTrainingPlan (userId: string, planId: string): Promise<void> {
    return await this.deleteByPartitionAndSortKey(userId, planId)
  }
}
