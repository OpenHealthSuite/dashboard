import { UserSettingRepository } from './userSettingsRepository'
import { IBaseMongoRepository } from './baseMongoRepository'
import { ok } from 'neverthrow'

const expectedDbName = 'user'
const expectedCollectionName = 'settings'

describe('UserSettingsRepository', () => {
  let fakeMongoRepo = {
    getOneByFilter: jest.fn(),
    replaceOneByFilter: jest.fn(),
    update: jest.fn()
  }

  let userSettingRepository = new UserSettingRepository(
    fakeMongoRepo as unknown as IBaseMongoRepository
  )

  beforeEach(() => {
    fakeMongoRepo = {
      getOneByFilter: jest.fn(),
      replaceOneByFilter: jest.fn(),
      update: jest.fn()
    }
    userSettingRepository = new UserSettingRepository(
      fakeMongoRepo as unknown as IBaseMongoRepository
    )
  })
  describe('getSettings', () => {
    test('gets from repo', async () => {
      const userSetting = {
        userId: 'someUserId',
        settingId: 'SomeSettingId',
        details: {
          whoami: 'details'
        }
      }
      fakeMongoRepo.getOneByFilter.mockResolvedValue(ok(userSetting))
      const result = await userSettingRepository.getSetting(userSetting.userId, userSetting.settingId)
      expect(result).toBe(userSetting)
      expect(fakeMongoRepo.getOneByFilter).toBeCalledTimes(1)
      expect(fakeMongoRepo.getOneByFilter).toBeCalledWith(expectedDbName, expectedCollectionName, { userId: userSetting.userId, settingId: userSetting.settingId })
    })
  })

  describe('updateSetting', () => {
    test('saves to mongo', async () => {
      const userSetting = {
        userId: 'someUserId',
        settingId: 'SomeSettingId',
        details: {
          whoami: 'details'
        }
      }
      const userSettingForCache = {
        _id: '542c2b97bac0595474108b48',
        userId: 'someUserId',
        settingId: 'SomeSettingId',
        details: {
          whoami: 'details'
        }
      }
      fakeMongoRepo.replaceOneByFilter.mockResolvedValue(ok(userSettingForCache))
      await userSettingRepository.updateSetting(userSetting.userId, userSetting.settingId, userSetting.details)
      expect(fakeMongoRepo.replaceOneByFilter).toBeCalledTimes(1)
      expect(fakeMongoRepo.replaceOneByFilter).toBeCalledWith(expectedDbName, expectedCollectionName, { userId: userSetting.userId, settingId: userSetting.settingId }, userSetting)
    })
  })
})
