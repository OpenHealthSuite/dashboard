import * as baseMongoRepository from './baseMongoRepository'

export interface IUserServiceToken<T> {
    userId: string,
    serviceId: string,
    token: T
}

export class UserServiceTokenRepository<T> {
  private readonly _serviceId: string;
  private readonly _cacheKey: string;
  private readonly _baseMongoRepo: baseMongoRepository.IBaseMongoRepository;
  private readonly _dbName: string = 'user'
  private readonly _collectionName: string = 'token'
  constructor (serviceId: string, baseMongoRepo = baseMongoRepository) {
    this._serviceId = serviceId
    this._cacheKey = `${this._dbName}:${this._collectionName}:${this._serviceId}`
    this._baseMongoRepo = baseMongoRepo
  }

  async getUserToken (userId: string): Promise<T | undefined> {
    const result = await this._baseMongoRepo.getOneByFilter<IUserServiceToken<T>>(this._dbName, this._collectionName, { serviceId: this._serviceId, userId })
    return result.unwrapOr({ token: undefined }).token
  }

  async updateUserToken (userId: string, token: T) {
    await this._baseMongoRepo.replaceOneByFilter(this._dbName, this._collectionName, { userId, serviceId: this._serviceId }, { userId, serviceId: this._serviceId, token })
  }
}
