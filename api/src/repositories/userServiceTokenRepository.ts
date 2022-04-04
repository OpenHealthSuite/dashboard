import { err, ok, Result } from 'neverthrow'
import { Pool } from 'pg'
import { configuredDbPool } from './configuredDbPool'
export interface IUserServiceToken<T> {
    userId: string,
    serviceId: string,
    token: T
}

export class UserServiceTokenRepository<T> {
  private readonly _serviceId: string;
  private readonly _tableName: string = 'user_service_token'
  private readonly _postgresPool: Pool;
  private readonly _dbName: string = 'user'
  private readonly _collectionName: string = 'token'
  constructor (serviceId: string, pool: Pool = configuredDbPool) {
    this._serviceId = serviceId
    this._postgresPool = pool
  }

  async createUserToken (userId: string, token: T): Promise<Result<T, string>> {
    try {
      const insertQuery = `INSERT INTO ${this._tableName} (service_id, user_id, token) VALUES ($1, $2, $3)`
      const result = await this._postgresPool.query(insertQuery, [this._serviceId, userId, token])
      return result.rowCount > 0 ? ok(result.rows[0].token) : err('Nothing Inserted')
    } catch (error: any) {
      return err(error.message)
    }
  }

  async deleteUserToken (userId: string): Promise<Result<null, string>> {
    const deleteQuery = `DELETE FROM ${this._tableName} ust WHERE ust.service_id = $1 AND ust.user_id = $2`
    try {
      await this._postgresPool.query(deleteQuery, [this._serviceId, userId])
      return ok(null)
    } catch (error: any) {
      return err(error.message)
    }
  }

  async getUserToken (userId: string): Promise<Result<T | null, string>> {
    const selectQuery = `SELECT token FROM ${this._tableName} ust WHERE ust.service_id = $1 AND ust.user_id = $2`
    const result = await this._postgresPool.query<{ token: T}>(selectQuery, [this._serviceId, userId])
    return result.rowCount > 0 ? ok(result.rows[0].token) : ok(null)
  }

  async updateUserToken (userId: string, token: T): Promise<Result<T, string>> {
    try {
      const updateQuery = `UPDATE ${this._tableName} SET token = $3 WHERE service_id = $1 AND user_id = $2`
      await this._postgresPool.query(updateQuery, [this._serviceId, userId, token])
      return ok(token)
    } catch (error: any) {
      return err(error.message)
    }
  }
}
