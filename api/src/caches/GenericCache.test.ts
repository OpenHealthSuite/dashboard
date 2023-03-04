import { GenericCacheValue, GetByKey, SaveOnKey } from './GenericCache'

describe('GetByKey', () => {
  it('Happy Path :: asks redis for value, gets value, returns it', async () => {
    const cachedValue = {
      cachedValue: 'ThisIsAValue',
      date: new Date(1987, 12, 24)
    }

    const fakeRedis = {
      get: jest.fn().mockReturnValueOnce(JSON.stringify(cachedValue))
    }

    const cacheKey = 'my-cache-key'

    const result: GenericCacheValue<any> | undefined = await GetByKey(cacheKey, fakeRedis as any)

    expect(fakeRedis.get.mock.calls.length).toBe(1)
    expect(fakeRedis.get.mock.calls[0]).toEqual([cacheKey])
    expect(result?.value).toEqual(cachedValue.cachedValue)
    expect(result?.date).toEqual(cachedValue.date)
  })
})

describe('SaveOnKey', () => {
  it('Happy Path :: serialises and saves data', async () => {
    const valueToCache = {
      a: 'ThisIsAValue',
      b: 'ThisIsAnotherValue'
    }

    const cacheKey = 'thisisacachekey'

    const savedDate = new Date()

    const fakeRedis = {
      set: jest.fn()
    }

    await SaveOnKey(cacheKey, valueToCache, fakeRedis as any, savedDate)

    expect(fakeRedis.set.mock.calls.length).toBe(1)
    const fakeSetCall = fakeRedis.set.mock.calls[0]
    expect(fakeSetCall[0]).toBe(cacheKey)
    expect(fakeSetCall[1]).toBe(JSON.stringify({ cachedValue: valueToCache, date: savedDate }))
  })
})
