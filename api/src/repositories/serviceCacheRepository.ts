import IORedis from 'ioredis'

export interface ICachedResponse {
    serialisedResponse: string,
    date: Date
}

export class ServiceCacheRepository {
  private _redis: IORedis.Redis;
  constructor () {
    this._redis = new IORedis(parseInt(process.env.REDIS_PORT ?? '6379'), process.env.REDIS_HOST ?? 'localhost')
  }

  async GetResponse (userId: string, url: string): Promise<ICachedResponse> {
    const cachedValue = await this._redis.get(`${userId}:${url}`)
    return cachedValue ? JSON.parse(cachedValue) : undefined
  }

  async SaveResponse (userId: string, url: string, serialisedResponse: string) {
    return await this._redis.set(`${userId}:${url}`, JSON.stringify({ serialisedResponse, date: new Date() }))
  }
}
