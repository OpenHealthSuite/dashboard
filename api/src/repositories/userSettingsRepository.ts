/* eslint-disable camelcase */
import { Pool } from 'pg'
import { err, ok, Result } from 'neverthrow'
import { configuredDbPool } from './configuredDbPool'

export interface IUserSetting {
    user_id: string,
    setting_id: string,
    details: any
}

export class UserSettingRepository {
  private readonly _postgresPool: Pool;
  private readonly _tableName: string = 'user_setting'
  constructor (pgPool = configuredDbPool) {
    this._postgresPool = pgPool
  }

  public async createSetting (user_id: string, setting_id: string, details: any): Promise<Result<IUserSetting, string>> {
    try {
      const insertQuery = `INSERT INTO ${this._tableName} (user_id, setting_id, details) VALUES ($1, $2, $3)`
      const result = await this._postgresPool.query(insertQuery, [user_id, setting_id, details])
      return result.rowCount > 0 ? ok(result.rows[0]) : err('Nothing Inserted')
    } catch (error: any) {
      console.log(error)
      return err(error.message)
    }
  }

  public async getSetting (user_id: string, setting_id: string): Promise<Result<IUserSetting | null, string>> {
    const selectQuery = `SELECT * FROM ${this._tableName} us WHERE us.user_id = $1 AND us.setting_id = $2`
    const result = await this._postgresPool.query<IUserSetting>(selectQuery, [user_id, setting_id])
    return result.rowCount > 0 ? ok(result.rows[0]) : ok(null)
  }

  public async updateSetting (user_id: string, setting_id: string, details: any): Promise<Result<null, string>> {
    try {
      const updateQuery = `UPDATE ${this._tableName} SET details = $3 WHERE user_id = $1 AND setting_id = $2`
      await this._postgresPool.query(updateQuery, [user_id, setting_id, details])
      return ok(null)
    } catch (error: any) {
      console.log(error)
      return err(error.message)
    }
  }
}
