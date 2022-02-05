import { BaseRedisCache } from './baseRedisCache'

export interface ICachedResponse {
    serialisedResponse: string,
    date: Date
}

export class ServiceCache extends BaseRedisCache {
  constructor () {
    super('servicecache')
  }

  async GetResponse (userId: string, url: string): Promise<ICachedResponse | undefined> {
    const cachedValue = await this.BaseGetResponse(`${userId}:${url}`)
    return cachedValue ? { serialisedResponse: cachedValue.cachedValue, date: cachedValue.date } : undefined
  }

  async SaveResponse (userId: string, url: string, serialisedResponse: string) {
    return await this.BaseSaveResponse(`${userId}:${url}`, serialisedResponse)
  }
}
