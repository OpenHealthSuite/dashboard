import IORedis from 'ioredis'

export interface IBaseCachedValue {
    itemKey: string,
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

  async BaseGetResponse (itemKey: string): Promise<IBaseCachedValue> {
    const cachedValue = await this._redis.get(`${this._cacheKey}:${itemKey}`)
    return cachedValue ? JSON.parse(cachedValue) : { serialisedResponse: '', date: new Date(1920, 12, 1) }
  }

  async BaseSaveResponse (itemKey: string, itemValue: string) {
    return await this._redis.set(`${this._cacheKey}:${itemKey}`, JSON.stringify({ itemValue, date: new Date() }))
  }
}
