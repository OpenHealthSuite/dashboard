import IORedis from 'ioredis'

export interface GenericCacheValue<T> {
  value: T,
  date: Date
}

export interface IBaseCachedValue {
  cachedValue: string,
  date: Date
}

const REDIS_CONNECTION = new IORedis(parseInt(process.env.REDIS_PORT ?? '6379'), process.env.REDIS_HOST ?? 'localhost')

export async function GetByKey<T> (cacheKey: string, redisConnection: IORedis.Redis = REDIS_CONNECTION): Promise<GenericCacheValue<T> | undefined> {
  const cachedValueRaw = await redisConnection.get(`${cacheKey}`)
  const cachedValue = cachedValueRaw ? JSON.parse(cachedValueRaw) : undefined
  return cachedValue ? { value: cachedValue.cachedValue, date: cachedValue.date } : cachedValue
}

export async function SaveOnKey<T> (cacheKey: string, value: T, redisConnection: IORedis.Redis = REDIS_CONNECTION): Promise<void> {
  await redisConnection.set(`${cacheKey}`, JSON.stringify({ cachedValue: value, date: new Date() }))
}
