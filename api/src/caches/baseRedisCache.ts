import IORedis from 'ioredis'
import redisSingleton from './redisSingleton'

export interface IBaseCachedValue {
    cachedValue: string,
    date: Date
}

export abstract class BaseRedisCache {
  private _redis: IORedis.Redis;
  private readonly _cacheKey: string;
  constructor (cacheKey: string, redisConnection: IORedis.Redis = redisSingleton.connection) {
    this._cacheKey = cacheKey
    this._redis = redisConnection
  }

  protected async BaseGetResponse (itemKey: string): Promise<IBaseCachedValue | undefined> {
    const cachedValue = await this._redis.get(`${this._cacheKey}:${itemKey}`)
    return cachedValue ? JSON.parse(cachedValue) : undefined
  }

  protected async BaseSaveResponse (itemKey: string, itemValue: string): Promise<void> {
    await this._redis.set(`${this._cacheKey}:${itemKey}`, JSON.stringify({ cachedValue: itemValue, date: new Date() }))
  }
}
