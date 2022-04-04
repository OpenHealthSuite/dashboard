import * as baseMongoRepository from './baseMongoRepository'

export interface IUserSetting {
    userId: string,
    settingId: string,
    details: any
}

export class UserSettingRepository {
  private readonly _cacheKey: string;
  private readonly _baseMongoRepo: baseMongoRepository.IBaseMongoRepository;
  private readonly _dbName: string = 'user'
  private readonly _collectionName: string = 'settings'
  constructor (baseMongoRepo = baseMongoRepository) {
    this._cacheKey = `${this._dbName}:${this._collectionName}`
    this._baseMongoRepo = baseMongoRepo
  }

  public async getSetting (userId: string, settingId: string): Promise<IUserSetting> {
    const result = await this._baseMongoRepo.getOneByFilter<IUserSetting>(this._dbName, this._collectionName, { userId, settingId })
    return result.unwrapOr<IUserSetting>({ userId, settingId, details: null })
  }

  public async updateSetting (userId: string, settingId: string, details: any): Promise<void> {
    await this._baseMongoRepo.replaceOneByFilter(this._dbName, this._collectionName, { userId, settingId }, { userId, settingId, details })
  }
}
