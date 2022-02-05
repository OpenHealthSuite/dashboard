import IORedis from 'ioredis'

export interface IBaseCachedValue {
    cachedValue: string,
    date: Date
}

export abstract class BaseRedisCache {
  private _redis: IORedis.Redis;
  private readonly _cacheKey: string;
  constructor (cacheKey: string) {
    this._cacheKey = cacheKey
    this._redis = new IORedis(parseInt(process.env.REDIS_PORT ?? '6379'), process.env.REDIS_HOST ?? 'localhost')
  }

  protected async BaseGetResponse (itemKey: string): Promise<IBaseCachedValue | undefined> {
    const cachedValue = await this._redis.get(`${this._cacheKey}:${itemKey}`)
    return cachedValue ? JSON.parse(cachedValue) : undefined
  }

  protected async BaseSaveResponse (itemKey: string, itemValue: string) {
    return await this._redis.set(`${this._cacheKey}:${itemKey}`, JSON.stringify({ cachedValue: itemValue, date: new Date() }))
  }
}
