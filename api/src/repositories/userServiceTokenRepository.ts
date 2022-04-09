/* eslint-disable camelcase */
import { err, ok, Result } from 'neverthrow'
import { Pool } from 'pg'
import { configuredDbPool } from './configuredDbPool'

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

const defaultNowGenerator = () => new Date()

export class UserServiceTokenRepository {
  private readonly _serviceId: string;
  private readonly _tableName: string = 'user_service_token'
  private readonly _postgresPool: Pool;
  private readonly _dbName: string = 'user'
  private readonly _collectionName: string = 'token'
  private readonly _nowGenerator: () => Date
  constructor (serviceId: string, pool: Pool = configuredDbPool, nowGenerator: () => Date = defaultNowGenerator) {
    this._serviceId = serviceId
    this._postgresPool = pool
    this._nowGenerator = nowGenerator
  }

  async createUserToken (userId: string, token: IRawToken): Promise<Result<IRawToken, string>> {
    try {
      const insertQuery = `INSERT INTO ${this._tableName} (service_id, paceme_user_id, raw_token, last_updated, expires_in) VALUES ($1, $2, $3, $4, $5)`
      const result = await this._postgresPool.query(insertQuery, [this._serviceId, userId, token, this._nowGenerator(), token.expires_in])
      return result.rowCount > 0 ? ok(result.rows[0].raw_token) : err('Nothing Inserted')
    } catch (error: any) {
      return err(error.message)
    }
  }

  async deleteUserToken (userId: string): Promise<Result<null, string>> {
    const deleteQuery = `DELETE FROM ${this._tableName} ust WHERE ust.service_id = $1 AND ust.paceme_user_id = $2`
    try {
      await this._postgresPool.query(deleteQuery, [this._serviceId, userId])
      return ok(null)
    } catch (error: any) {
      return err(error.message)
    }
  }

  async getUserToken (userId: string): Promise<Result<{ raw_token: IRawToken, last_updated: Date } | null, string>> {
    const selectQuery = `SELECT raw_token, last_updated FROM ${this._tableName} ust WHERE ust.service_id = $1 AND ust.paceme_user_id = $2`
    const result = await this._postgresPool.query<{ raw_token: IRawToken, last_updated: Date }>(selectQuery, [this._serviceId, userId])
    return result.rowCount > 0 ? ok(result.rows[0]) : ok(null)
  }

  async updateUserToken (userId: string, token: IRawToken): Promise<Result<IRawToken, string>> {
    try {
      const updateQuery = `UPDATE ${this._tableName} SET raw_token = $3, last_updated = $4, expires_in = $5 WHERE service_id = $1 AND paceme_user_id = $2`
      await this._postgresPool.query(updateQuery, [this._serviceId, userId, token, this._nowGenerator(), token.expires_in])
      return ok(token)
    } catch (error: any) {
      return err(error.message)
    }
  }
}
