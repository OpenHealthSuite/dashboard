import IORedis from 'ioredis'

export const REDIS_CLIENT = new IORedis(parseInt(process.env.REDIS_PORT ?? '6379'), process.env.REDIS_HOST ?? 'localhost')

export interface GenericCacheValue<T> {
  value: T,
  date: Date
}

export interface IBaseCachedValue {
  cachedValue: string,
  date: Date
}

export interface IGenericCache {
  GetByKey: <T> (cacheKey: string) => Promise<GenericCacheValue<T> | undefined>,
  SaveOnKey: <T> (cacheKey: string, value: T) => Promise<void>,
  // I dislike this
  REDIS_CLIENT: IORedis.Redis
}

export async function GetByKey<T> (cacheKey: string, redisConnection: IORedis.Redis = REDIS_CLIENT): Promise<GenericCacheValue<T> | undefined> {
  const cachedValueRaw = await redisConnection.get(`${cacheKey}`)
  const cachedValue = cachedValueRaw ? JSON.parse(cachedValueRaw) : undefined
  return cachedValue ? { value: cachedValue.cachedValue, date: new Date(cachedValue.date) } : cachedValue
}

export async function SaveOnKey<T> (cacheKey: string, value: T, redisConnection: IORedis.Redis = REDIS_CLIENT, saveDate: Date = new Date()): Promise<void> {
  await redisConnection.set(`${cacheKey}`, JSON.stringify({ cachedValue: value, date: saveDate }))
}
