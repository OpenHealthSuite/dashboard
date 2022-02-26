import { GenericCache } from '../caches/GenericCache'
import * as baseDynamoRepo from './baseDynamoPartitionRepository'

export interface IUserSetting {
    userId: string,
    settingId: string,
    details: any
}

export class UserSettingRepository {
  private readonly cache: GenericCache<IUserSetting>;
  constructor () {
    this.cache = new GenericCache<IUserSetting>('userSettingCache')
  }

  public async getSetting (userId: string, settingId: string): Promise<IUserSetting> {
    const cachedValue = await this.cache.GetByKey(userId)
    if (cachedValue) {
      return cachedValue.value
    }
    const result = await baseDynamoRepo.getByPartitionAndSortKeys<IUserSetting>(process.env.USER_SETTING_TABLE ?? 'UserSetting', 'userId', userId, 'settingId', settingId)
    await this.cache.SaveOnKey(`${userId}:${settingId}`, result)
    return result
  }

  public async updateSetting (userId: string, settingId: string, details: any): Promise<void> {
    await baseDynamoRepo.update(process.env.USER_SETTING_TABLE ?? 'UserSetting', { userId, settingId, details })
    await this.cache.SaveOnKey(`${userId}:${settingId}`, { userId, settingId, details })
  }
}
