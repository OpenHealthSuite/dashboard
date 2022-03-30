import { UserSettingRepository } from './userSettingsRepository'
import { IBaseMongoRepository } from './baseMongoRepository'
import { IGenericCache } from '../caches/GenericCache'

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

  const expectedCacheKey = 'userSettingCache'

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
  })
})
