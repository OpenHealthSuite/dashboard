/* eslint-disable camelcase */
import * as baseMongoRepository from './baseMongoRepository'
import { Pool } from 'pg'
import { err, ok, Result } from 'neverthrow'

export interface IUserSetting {
    user_id: string,
    setting_id: string,
    details: any
}

const usesrDbPool = new Pool()

export class UserSettingRepository {
  private readonly _baseMongoRepo: baseMongoRepository.IBaseMongoRepository;
  private readonly _postgresPool: Pool;
  private readonly _dbName: string = 'user'
  private readonly _collectionName: string = 'settings'
  constructor (baseMongoRepo = baseMongoRepository, pgPool = usesrDbPool) {
    this._baseMongoRepo = baseMongoRepo
    this._postgresPool = pgPool
  }

  public async getSetting (user_id: string, setting_id: string): Promise<Result<IUserSetting, string>> {
    const result = await this._postgresPool.query<IUserSetting>('SELECT * FROM user_settings us WHERE us.user_id = $1 AND us.setting_id = $2', [user_id, setting_id])
    return result.rowCount > 0 ? ok(result.rows[0]) : err('Not Found')
  }

  public async updateSetting (userId: string, settingId: string, details: any): Promise<void> {
    await this._baseMongoRepo.replaceOneByFilter(this._dbName, this._collectionName, { userId, settingId }, { userId, settingId, details })
  }
}
