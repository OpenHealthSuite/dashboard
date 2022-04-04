import { err, ok, Result } from 'neverthrow'
import { Pool } from 'pg'
export interface IUserServiceToken<T> {
    userId: string,
    serviceId: string,
    token: T
}

const userDbPool = new Pool()
export class UserServiceTokenRepository<T> {
  private readonly _serviceId: string;
  private readonly _tableName: string = 'user_service_token'
  private readonly _postgresPool: Pool;
  private readonly _dbName: string = 'user'
  private readonly _collectionName: string = 'token'
  constructor (serviceId: string, pool: Pool = userDbPool) {
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

  async getUserToken (userId: string): Promise<Result<T | null, string>> {
    const selectQuery = `SELECT token FROM ${this._tableName} ust WHERE ust.service_id = $1 AND ust.user_id = $2`
    const result = await this._postgresPool.query<{ token: T}>(selectQuery, [this._serviceId, userId])
    return result.rowCount > 0 ? ok(result.rows[0].token) : ok(null)
  }

  async updateUserToken (userId: string, token: T): Promise<Result<T, string>> {
    try {
      const updateQuery = `UPDATE ${this._tableName} ust SET ust.token = $3 WHERE ust.service_id = $1 AND ust.user_id = $2`
      await this._postgresPool.query(updateQuery, [this._serviceId, userId, token])
      return ok(token)
    } catch (error: any) {
      return err(error.message)
    }
  }
}
