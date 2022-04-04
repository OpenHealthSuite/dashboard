import { UserSettingRepository } from './userSettingsRepository'
import { IBaseMongoRepository } from './baseMongoRepository'
import { ok } from 'neverthrow'
import { Pool } from 'pg'

const expectedDbName = 'user'
const expectedCollectionName = 'settings'

describe('UserSettingsRepository', () => {
  let fakeMongoRepo = {
    getOneByFilter: jest.fn(),
    replaceOneByFilter: jest.fn(),
    update: jest.fn()
  }

  let fakePostgresPool = {
    query: jest.fn()
  }

  let userSettingRepository = new UserSettingRepository(
    fakeMongoRepo as unknown as IBaseMongoRepository,
    fakePostgresPool as unknown as Pool
  )

  beforeEach(() => {
    fakeMongoRepo = {
      getOneByFilter: jest.fn(),
      replaceOneByFilter: jest.fn(),
      update: jest.fn()
    }
    fakePostgresPool = {
      query: jest.fn()
    }
    userSettingRepository = new UserSettingRepository(
      fakeMongoRepo as unknown as IBaseMongoRepository,
      fakePostgresPool as unknown as Pool
    )
  })
  describe('getSettings', () => {
    test('gets from repo', async () => {
      const userSetting = {
        user_id: 'someUserId',
        setting_id: 'SomeSettingId',
        details: {
          whoami: 'details'
        }
      }
      const expectedQuery = 'SELECT * FROM user_settings us WHERE us.user_id = $1 AND us.setting_id = $2'
      const expectedArguments = [userSetting.user_id, userSetting.setting_id]
      fakePostgresPool.query.mockResolvedValue({ rowCount: 1, rows: [userSetting] })
      const result = await userSettingRepository.getSetting(userSetting.user_id, userSetting.setting_id)
      expect(result).toBe(userSetting)
      expect(fakePostgresPool.query).toBeCalledTimes(1)
      expect(fakePostgresPool.query).toBeCalledWith(expectedQuery, expectedArguments)
    })
    test('nothing found :: returns null', async () => {
      const userSetting = {
        user_id: 'someUserId',
        setting_id: 'SomeSettingId',
        details: null
      }
      const expectedQuery = 'SELECT * FROM user_settings us WHERE us.user_id = $1 AND us.setting_id = $2'
      const expectedArguments = [userSetting.user_id, userSetting.setting_id]
      fakePostgresPool.query.mockResolvedValue({ rowCount: 0, rows: [] })
      const result = await userSettingRepository.getSetting(userSetting.user_id, userSetting.setting_id)
      expect(result).toStrictEqual(userSetting)
      expect(fakePostgresPool.query).toBeCalledTimes(1)
      expect(fakePostgresPool.query).toBeCalledWith(expectedQuery, expectedArguments)
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
