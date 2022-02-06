import { GenericCache } from '../caches/GenericCache'
import { BaseDynamoPartitionSortRepository } from './baseDynamoPartitionSortRepository'

export interface IUserSetting {
    userId: string,
    settingId: string,
    details: any
}

export class UserSettingRepository extends BaseDynamoPartitionSortRepository<IUserSetting> {
  private readonly cache: GenericCache<IUserSetting>;
  constructor () {
    super(
      process.env.USER_SETTING_TABLE ?? 'UserSetting',
      'userId',
      'settingId',
      {
        '#details': 'details'
      }
    )
    this.cache = new GenericCache<IUserSetting>('userSettingCache')
  }

  public async getSetting (userId: string, settingId: string): Promise<IUserSetting> {
    const cachedValue = await this.cache.GetByKey(userId)
    if (cachedValue) {
      return cachedValue.value
    }
    const result = await this.getByPartitionAndSortKeys(userId, settingId)
    await this.cache.SaveOnKey(`${userId}:${settingId}`, result)
    return result
  }

  public async updateSetting (userId: string, settingId: string, details: any): Promise<void> {
    await this.update({ userId, settingId, details })
    await this.cache.SaveOnKey(`${userId}:${settingId}`, { userId, settingId, details })
  }
}
