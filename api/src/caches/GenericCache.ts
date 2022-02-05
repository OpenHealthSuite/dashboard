import { BaseRedisCache } from './baseRedisCache'

export class GenericCache<T> extends BaseRedisCache {
  async GetByKey (cackeKey: string): Promise<{value: T, date: Date } | undefined> {
    const cachedValue = await this.BaseGetResponse(cackeKey)
    return cachedValue ? { value: JSON.parse(cachedValue.cachedValue), date: cachedValue.date } : cachedValue
  }

  async SaveOnKey (cacheKey: string, value: T) {
    return await this.BaseSaveResponse(cacheKey, JSON.stringify(value))
  }
}
