import { BaseDynamoPartitionSortRepository } from './baseDynamoPartitionSortRepository'

export interface IUserSetting {
    userId: string,
    settingId: string,
    details: any
}

export class TrainingPlanRepository extends BaseDynamoPartitionSortRepository<IUserSetting> {
  constructor () {
    super(
      process.env.USER_SETTING_TABLE ?? 'UserSetting',
      'userId',
      'settingId',
      {
        '#details': 'details'
      }
    )
  }
}
