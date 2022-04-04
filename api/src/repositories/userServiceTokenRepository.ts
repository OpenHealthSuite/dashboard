import { err, ok, Result } from 'neverthrow'
import { Pool } from 'pg'
import * as baseMongoRepository from './baseMongoRepository'

export interface IUserServiceToken<T> {
    userId: string,
    serviceId: string,
    token: T
}

const userDbPool = new Pool()
export class UserServiceTokenRepository<T> {
  private readonly _serviceId: string;
  private readonly _tableName: string = 'user_service_token'
  private readonly _cacheKey: string;
  private readonly _baseMongoRepo: baseMongoRepository.IBaseMongoRepository;
  private readonly _postgresPool: Pool;
  private readonly _dbName: string = 'user'
  private readonly _collectionName: string = 'token'
  constructor (serviceId: string, baseMongoRepo = baseMongoRepository, pool: Pool = userDbPool) {
    this._serviceId = serviceId
    this._cacheKey = `${this._dbName}:${this._collectionName}:${this._serviceId}`
    this._baseMongoRepo = baseMongoRepo
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

  async updateUserToken (userId: string, token: T) {
    await this._baseMongoRepo.replaceOneByFilter(this._dbName, this._collectionName, { userId, serviceId: this._serviceId }, { userId, serviceId: this._serviceId, token })
  }
}
