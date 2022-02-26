import * as GenericCache from '../caches/GenericCache'
import * as baseDynamoRepo from './baseDynamoPartitionRepository'

export interface IUserSetting {
    userId: string,
    settingId: string,
    details: any
}

export class UserSettingRepository {
  private readonly CACHE_KEY: string;
  constructor () {
    this.CACHE_KEY = 'userSettingCache'
  }

  public async getSetting (userId: string, settingId: string): Promise<IUserSetting> {
    const cachedValue = await GenericCache.GetByKey<IUserSetting>(`${this.CACHE_KEY}:${userId}:${settingId}`)
    if (cachedValue) {
      return cachedValue.value
    }
    const result = await baseDynamoRepo.getByPartitionAndSortKeys<IUserSetting>(process.env.USER_SETTING_TABLE ?? 'UserSetting', 'userId', userId, 'settingId', settingId)
    await GenericCache.SaveOnKey(`${this.CACHE_KEY}:${userId}:${settingId}`, result)
    return result
  }

  public async updateSetting (userId: string, settingId: string, details: any): Promise<void> {
    await baseDynamoRepo.update(process.env.USER_SETTING_TABLE ?? 'UserSetting', { userId, settingId, details })
    await GenericCache.SaveOnKey(`${this.CACHE_KEY}:${userId}:${settingId}`, { userId, settingId, details })
  }
}
