import { UserSettingRepository } from './userSettingsRepository'
import { Pool } from 'pg'

describe('UserSettingsRepository', () => {
  let fakePostgresPool = {
    query: jest.fn()
  }

  let userSettingRepository = new UserSettingRepository(
    fakePostgresPool as unknown as Pool
  )

  beforeEach(() => {
    fakePostgresPool = {
      query: jest.fn()
    }
    userSettingRepository = new UserSettingRepository(
      fakePostgresPool as unknown as Pool
    )
  })

  describe('createSetting', () => {
    test('saves to pg', async () => {
      const userSetting = {
        user_id: 'someUserId',
        setting_id: 'SomeSettingId',
        details: {
          whoami: 'details'
        }
      }
      fakePostgresPool.query.mockResolvedValue({ rowCount: 1, rows: [userSetting] })
      const expectedQuery = 'INSERT INTO user_settings (user_id, setting_id, details) VALUES ($1, $2, $3)'
      const expectedArguments = [userSetting.user_id, userSetting.setting_id, userSetting.details]
      await userSettingRepository.createSetting(userSetting.user_id, userSetting.setting_id, userSetting.details)
      expect(fakePostgresPool.query).toBeCalledTimes(1)
      expect(fakePostgresPool.query).toBeCalledWith(expectedQuery, expectedArguments)
    })
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
      expect(result.isOk()).toBeTruthy()
      expect(result._unsafeUnwrap()).toBe(userSetting)
      expect(fakePostgresPool.query).toBeCalledTimes(1)
      expect(fakePostgresPool.query).toBeCalledWith(expectedQuery, expectedArguments)
    })
    test('nothing found :: returns error', async () => {
      const userSetting = {
        user_id: 'someUserId',
        setting_id: 'SomeSettingId',
        details: null
      }
      const expectedQuery = 'SELECT * FROM user_settings us WHERE us.user_id = $1 AND us.setting_id = $2'
      const expectedArguments = [userSetting.user_id, userSetting.setting_id]
      fakePostgresPool.query.mockResolvedValue({ rowCount: 0, rows: [] })
      const result = await userSettingRepository.getSetting(userSetting.user_id, userSetting.setting_id)
      expect(result.isErr()).toBeTruthy()
      expect(fakePostgresPool.query).toBeCalledTimes(1)
      expect(fakePostgresPool.query).toBeCalledWith(expectedQuery, expectedArguments)
    })
  })

  describe('updateSetting', () => {
    test('saves to pg', async () => {
      const userSetting = {
        user_id: 'someUserId',
        setting_id: 'SomeSettingId',
        details: {
          whoami: 'details'
        }
      }
      fakePostgresPool.query.mockResolvedValue({ rowCount: 1, rows: [userSetting] })
      const expectedQuery = 'UPDATE user_settings us SET us.details = $3 WHERE us.user_id = $1 AND us.setting_id = $2'
      const expectedArguments = [userSetting.user_id, userSetting.setting_id, userSetting.details]
      await userSettingRepository.updateSetting(userSetting.user_id, userSetting.setting_id, userSetting.details)
      expect(fakePostgresPool.query).toBeCalledTimes(1)
      expect(fakePostgresPool.query).toBeCalledWith(expectedQuery, expectedArguments)
    })
  })
})
