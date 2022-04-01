import * as baseGenericCache from '../caches/GenericCache'
import * as baseMongoRepository from './baseMongoRepository'

export interface IUserSetting {
    userId: string,
    settingId: string,
    details: any
}

export class UserSettingRepository {
  private readonly _cacheKey: string;
  private readonly _baseMongoRepo: baseMongoRepository.IBaseMongoRepository;
  private readonly _baseGenericCache: baseGenericCache.IGenericCache
  private readonly _dbName: string = 'user'
  private readonly _collectionName: string = 'settings'
  constructor (baseMongoRepo = baseMongoRepository, baseCache = baseGenericCache) {
    this._cacheKey = `${this._dbName}:${this._collectionName}`
    this._baseMongoRepo = baseMongoRepo
    this._baseGenericCache = baseCache
  }

  public async getSetting (userId: string, settingId: string): Promise<IUserSetting> {
    const cachedValue = await this._baseGenericCache.GetByKey<IUserSetting>(`${this._cacheKey}:${userId}:${settingId}`)
    if (cachedValue) {
      return cachedValue.value
    }
    const result = await this._baseMongoRepo.getOneByFilter<IUserSetting>(this._dbName, this._collectionName, { userId, settingId })
    // We should propogate neverthrow up through the stack
    result.map(async userSetting => await this._baseGenericCache.SaveOnKey(`${this._cacheKey}:${userId}:${settingId}`, userSetting))
    return result.unwrapOr<IUserSetting>({ userId, settingId, details: null })
  }

  public async updateSetting (userId: string, settingId: string, details: any): Promise<void> {
    const result = await this._baseMongoRepo.replaceOneByFilter(this._dbName, this._collectionName, { userId, settingId }, { userId, settingId, details })
    result.map(async savedValue => await this._baseGenericCache.SaveOnKey(`${this._cacheKey}:${userId}:${settingId}`, savedValue))
  }
}
