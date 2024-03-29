/* eslint-disable camelcase */
import { err, ok, Result } from 'neverthrow'
import cassandra from 'cassandra-driver'
import { CASSANDRA_CLIENT } from './cassandra'
import { rowToObject } from './utilities'

export interface IUserSetting<T> {
    user_id: string,
    setting_id: string,
    details: T
}

type AvailableProviders = 'fitbit' | 'openfooddiary'

export type UserProviderSettings = {
  [key: string]: AvailableProviders
}

export class UserSettingRepository {
  private readonly _cassandraClient: cassandra.Client
  private readonly _tableName: string = 'user_setting'
  constructor (cassandraClient = CASSANDRA_CLIENT) {
    this._cassandraClient = cassandraClient
  }

  public async createSetting (user_id: string, setting_id: string, details: any): Promise<Result<IUserSetting<any>, string>> {
    try {
      const insertQuery = `INSERT INTO paceme.${this._tableName} (user_id, setting_id, details) VALUES (?, ?, ?);`
      await this._cassandraClient.execute(insertQuery, [user_id, setting_id, JSON.stringify(details)], { prepare: true })
      return ok({
        user_id,
        setting_id,
        details
      })
    } catch (error: any) {
      return err(error.message)
    }
  }

  public async getSetting<T> (user_id: string, setting_id: string): Promise<Result<IUserSetting<T> | null, string>> {
    const selectQuery = `SELECT * FROM paceme.${this._tableName} WHERE user_id = ? AND setting_id = ?;`
    const result = await this._cassandraClient.execute(selectQuery, [user_id, setting_id], { prepare: true })
    if (result.rowLength > 0) {
      const raw = rowToObject(result.rows[0]) as any
      raw.details = JSON.parse(raw.details)
      return ok(raw)
    }
    return ok(null)
  }

  public async updateSetting (user_id: string, setting_id: string, details: any): Promise<Result<null, string>> {
    try {
      const updateQuery = `UPDATE paceme.${this._tableName} SET details = ? WHERE user_id = ? AND setting_id = ?;`
      await this._cassandraClient.execute(updateQuery, [JSON.stringify(details), user_id, setting_id], { prepare: true })
      return ok(null)
    } catch (error: any) {
      return err(error.message)
    }
  }
}
