/* eslint-disable camelcase */
import { Pool } from 'pg'
import { err, ok, Result } from 'neverthrow'

export interface IUserSetting {
    user_id: string,
    setting_id: string,
    details: any
}

const usesrDbPool = new Pool()

export class UserSettingRepository {
  private readonly _postgresPool: Pool;
  private readonly _tableName: string = 'user_settings'
  constructor (pgPool = usesrDbPool) {
    this._postgresPool = pgPool
  }

  public async getSetting (user_id: string, setting_id: string): Promise<Result<IUserSetting, string>> {
    const result = await this._postgresPool.query<IUserSetting>(`SELECT * FROM ${this._tableName} us WHERE us.user_id = $1 AND us.setting_id = $2`, [user_id, setting_id])
    return result.rowCount > 0 ? ok(result.rows[0]) : err('Not Found')
  }

  public async updateSetting (user_id: string, setting_id: string, details: any): Promise<Result<null, string>> {
    try {
      await this._postgresPool.query<IUserSetting>(`UPDATE ${this._tableName} us SET us.details = $3 WHERE us.user_id = $1 AND us.setting_id = $2`, [user_id, setting_id, details])
      return ok(null)
    } catch (error: any) {
      return err(error.message)
    }
  }
}
