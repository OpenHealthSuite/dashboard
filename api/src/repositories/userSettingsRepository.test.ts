import { UserSettingRepository } from './userSettingsRepository'
import { IBaseMongoRepository } from './baseMongoRepository'
import { IGenericCache } from '../caches/GenericCache'
import { ok } from 'neverthrow'

const expectedDbName = 'user'
const expectedCollectionName = 'settings'
const expectedCacheKey = `${expectedDbName}:${expectedCollectionName}`

describe('UserSettingsRepository', () => {
  let fakeMongoRepo = {
    getOneByFilter: jest.fn(),
    update: jest.fn()
  }
  let fakeCache = {
    GetByKey: jest.fn(),
    SaveOnKey: jest.fn()
  }

  let userSettingRepository = new UserSettingRepository(
    fakeMongoRepo as unknown as IBaseMongoRepository,
    fakeCache as unknown as IGenericCache
  )

  beforeEach(() => {
    fakeMongoRepo = {
      getOneByFilter: jest.fn(),
      update: jest.fn()
    }
    fakeCache = {
      GetByKey: jest.fn(),
      SaveOnKey: jest.fn()
    }
    userSettingRepository = new UserSettingRepository(
      fakeMongoRepo as unknown as IBaseMongoRepository,
      fakeCache as unknown as IGenericCache
    )
  })
  test('Has cache value :: returns cache value', async () => {
    const userSetting = {
      userId: 'someUserId',
      settingId: 'SomeSettingId',
      details: {
        whoami: 'details'
      }
    }
    fakeCache.GetByKey.mockResolvedValue({ value: userSetting })
    const result = await userSettingRepository.getSetting(userSetting.userId, userSetting.settingId)
    expect(result).toBe(userSetting)
    expect(fakeCache.GetByKey).toBeCalledTimes(1)
    expect(fakeCache.GetByKey).toBeCalledWith(`${expectedCacheKey}:${userSetting.userId}:${userSetting.settingId}`)
    expect(fakeMongoRepo.getOneByFilter).toBeCalledTimes(0)
    expect(fakeCache.SaveOnKey).toBeCalledTimes(0)
  })
  test('no cache value :: gets from repo, saves to cache', async () => {
    const userSetting = {
      userId: 'someUserId',
      settingId: 'SomeSettingId',
      details: {
        whoami: 'details'
      }
    }
    fakeCache.GetByKey.mockResolvedValue(undefined)
    fakeMongoRepo.getOneByFilter.mockResolvedValue(ok(userSetting))
    const result = await userSettingRepository.getSetting(userSetting.userId, userSetting.settingId)
    expect(result).toBe(userSetting)
    expect(fakeCache.GetByKey).toBeCalledTimes(1)
    expect(fakeCache.GetByKey).toBeCalledWith(`${expectedCacheKey}:${userSetting.userId}:${userSetting.settingId}`)
    expect(fakeMongoRepo.getOneByFilter).toBeCalledTimes(1)
    expect(fakeMongoRepo.getOneByFilter).toBeCalledWith(expectedDbName, expectedCollectionName, { userId: userSetting.userId, settingId: userSetting.settingId })
    expect(fakeCache.SaveOnKey).toBeCalledTimes(1)
    expect(fakeCache.SaveOnKey).toBeCalledWith(`${expectedCacheKey}:${userSetting.userId}:${userSetting.settingId}`, userSetting)
  })
})
