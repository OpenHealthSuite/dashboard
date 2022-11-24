/* eslint-disable camelcase */
import { err, ok, Result } from 'neverthrow'
import cassandra from 'cassandra-driver'
import { CASSANDRA_CLIENT } from './cassandra'
import { rowToObject } from './utilities'

export interface IRawToken {
  access_token: string,
  expires_in: number,
  refresh_token: string,
  scope: string,
  token_type: string,
  user_id: string
}

export interface IUserServiceToken {
  paceme_user_id: string,
  service_id: string,
  raw_token: IRawToken,
  last_updated: Date
}

export class UserServiceTokenRepository {
  private readonly _serviceId: string;
  private readonly _tableName: string = 'user_service_token'
  private readonly _cassandraClient: cassandra.Client;
  private readonly _dbName: string = 'user'
  private readonly _collectionName: string = 'token'
  constructor (serviceId: string, cassandraClient = CASSANDRA_CLIENT) {
    this._serviceId = serviceId
    this._cassandraClient = cassandraClient
  }

  async createUserToken (userId: string, token: IRawToken): Promise<Result<IRawToken, string>> {
    try {
      const insertQuery = `INSERT INTO paceme.${this._tableName} (service_id, paceme_user_id, raw_token, last_updated, expires_in) VALUES (?, ?, ?, ?, ?);`
      await this._cassandraClient.execute(insertQuery, [this._serviceId, userId, JSON.stringify(token), new Date(), token.expires_in], { prepare: true })
      return ok(token)
    } catch (error: any) {
      return err(error.message)
    }
  }

  async deleteUserToken (userId: string): Promise<Result<null, string>> {
    const deleteQuery = `DELETE FROM paceme.${this._tableName} WHERE service_id = ? AND paceme_user_id = ?`
    try {
      await this._cassandraClient.execute(deleteQuery, [this._serviceId, userId])
      return ok(null)
    } catch (error: any) {
      return err(error.message)
    }
  }

  async getUserToken (userId: string): Promise<Result<{ raw_token: IRawToken, last_updated: Date } | null, string>> {
    const selectQuery = `SELECT raw_token, last_updated FROM paceme.${this._tableName} WHERE service_id = ? AND paceme_user_id = ?;`
    const result = await this._cassandraClient.execute(selectQuery, [this._serviceId, userId])
    if (result.rowLength > 0) {
      const token = rowToObject(result.rows[0]) as any
      token.raw_token = JSON.parse(token.raw_token)
      token.last_updated = new Date(token.last_updated)
      return ok(token)
    }
    return ok(null)
  }

  async updateUserToken (userId: string, token: IRawToken): Promise<Result<IRawToken, string>> {
    try {
      const insertQuery = `INSERT INTO paceme.${this._tableName} (service_id, paceme_user_id, raw_token, last_updated, expires_in) VALUES (?, ?, ?, ?, ?);`
      await this._cassandraClient.execute(insertQuery, [this._serviceId, userId, JSON.stringify(token), new Date(), token.expires_in], { prepare: true })
      return ok(token)
    } catch (error: any) {
      return err(error.message)
    }
  }

  async getTokensThatExpireBefore (date: Date): Promise<Result<{ raw_token: IRawToken, paceme_user_id: string }[], string>> {
    const selectQuery = `SELECT paceme_user_id, raw_token, last_updated, expires_in FROM paceme.${this._tableName} WHERE service_id = ? ALLOW FILTERING;`
    try {
      const result = await this._cassandraClient.execute(selectQuery, [this._serviceId])
      const tokens = result.rows.reduce((prev, raw) => {
        const token = rowToObject(raw) as any
        token.raw_token = JSON.parse(token.raw_token)
        const tokenExpiryTime = new Date((token.last_updated as Date).setSeconds((token.last_updated as Date).getSeconds() + token.expires_in))
        if (tokenExpiryTime > date) {
          return prev
        }
        return [...prev, token]
      }, [] as any[])
      return ok(tokens)
    } catch (ex: any) {
      console.error(ex)
      return err(ex.message)
    }
  }
}
