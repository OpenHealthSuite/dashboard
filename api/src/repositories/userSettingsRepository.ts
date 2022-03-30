import * as baseGenericCache from '../caches/GenericCache'
import * as baseDynamoRepo from './baseDynamoPartitionRepository'
import * as baseMongoRepository from './baseMongoRepository'

export interface IUserSetting {
    userId: string,
    settingId: string,
    details: any
}

export class UserSettingRepository {
  private readonly CACHE_KEY: string;
  private readonly _baseMongoRepo: baseMongoRepository.IBaseMongoRepository;
  private readonly _baseGenericCache: baseGenericCache.IGenericCache
  constructor (baseMongoRepo = baseMongoRepository, baseCache = baseGenericCache) {
    this.CACHE_KEY = 'userSettingCache'
    this._baseMongoRepo = baseMongoRepo
    this._baseGenericCache = baseCache
  }

  public async getSetting (userId: string, settingId: string): Promise<IUserSetting> {
    const cachedValue = await this._baseGenericCache.GetByKey<IUserSetting>(`${this.CACHE_KEY}:${userId}:${settingId}`)
    if (cachedValue) {
      return cachedValue.value
    }
    const result = await baseDynamoRepo.getByKey<IUserSetting>(process.env.USER_SETTING_TABLE ?? 'UserSetting',
      {
        partitionKey: 'userId',
        partitionKeyValue: userId,
        sortKey: 'settingId',
        sortKeyValue: settingId
      })
    await this._baseGenericCache.SaveOnKey(`${this.CACHE_KEY}:${userId}:${settingId}`, result)
    return result
  }

  public async updateSetting (userId: string, settingId: string, details: any): Promise<void> {
    await baseDynamoRepo.update(process.env.USER_SETTING_TABLE ?? 'UserSetting', { userId, settingId, details })
    await this._baseGenericCache.SaveOnKey(`${this.CACHE_KEY}:${userId}:${settingId}`, { userId, settingId, details })
  }
}
