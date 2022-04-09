import { UserServiceTokenRepository } from './userServiceTokenRepository'
import { Pool } from 'pg'

const expectedServiceId = 'someservicename'

describe('UserSettingsRepository', () => {
  let fakePostgresPool = {
    query: jest.fn()
  }
  let fakeDateGenerator = jest.fn()

  let userServiceTokenRepository = new UserServiceTokenRepository(
    expectedServiceId,
    fakePostgresPool as unknown as Pool,
    fakeDateGenerator
  )

  beforeEach(() => {
    fakePostgresPool = {
      query: jest.fn()
    }
    fakeDateGenerator = jest.fn()
    userServiceTokenRepository = new UserServiceTokenRepository(
      expectedServiceId,
      fakePostgresPool as unknown as Pool,
      fakeDateGenerator
    )
  })

  describe('createUserToken', () => {
    test('saves to pg', async () => {
      const userId = 'SomeUserjnsdf!"£123'
      const userToken = { whoamI: 'userToken', expires_in: 456 }
      const date = new Date(1920, 12, 12)
      fakeDateGenerator.mockReturnValue(date)
      fakePostgresPool.query.mockResolvedValue({ rowCount: 1, rows: [{ raw_token: userToken, last_updated: date }] })
      const expectedQuery = 'INSERT INTO user_service_token (service_id, paceme_user_id, raw_token, last_updated, expires_in) VALUES ($1, $2, $3, $4, $5)'
      const expectedArguments = [expectedServiceId, userId, userToken, date, userToken.expires_in]
      await userServiceTokenRepository.createUserToken(userId, userToken as any)
      expect(fakePostgresPool.query).toBeCalledTimes(1)
      expect(fakePostgresPool.query).toBeCalledWith(expectedQuery, expectedArguments)
    })
  })

  describe('getUserToken', () => {
    test('gets from repo', async () => {
      const userId = 'SomeUserjnsdf!"£123'
      const userToken = { whoamI: 'userToken' }
      const date = new Date(1920, 12, 12)
      const expectedQuery = 'SELECT raw_token, last_updated FROM user_service_token ust WHERE ust.service_id = $1 AND ust.paceme_user_id = $2'
      const expectedArguments = [expectedServiceId, userId]
      fakePostgresPool.query.mockResolvedValue({ rowCount: 1, rows: [{ raw_token: userToken, last_updated: date }] })
      const result = await userServiceTokenRepository.getUserToken(userId)
      expect(result.isOk()).toBeTruthy()
      expect(result._unsafeUnwrap()).toStrictEqual({ raw_token: userToken, last_updated: date })
      expect(fakePostgresPool.query).toBeCalledTimes(1)
      expect(fakePostgresPool.query).toBeCalledWith(expectedQuery, expectedArguments)
    })
    test('nothing found :: returns null', async () => {
      const userId = 'SomeUserjnsdf!"£123'
      const expectedQuery = 'SELECT raw_token, last_updated FROM user_service_token ust WHERE ust.service_id = $1 AND ust.paceme_user_id = $2'
      const expectedArguments = [expectedServiceId, userId]
      fakePostgresPool.query.mockResolvedValue({ rowCount: 0, rows: [] })
      const result = await userServiceTokenRepository.getUserToken(userId)
      expect(result.isOk()).toBeTruthy()
      expect(result._unsafeUnwrap()).toBe(null)
      expect(fakePostgresPool.query).toBeCalledTimes(1)
      expect(fakePostgresPool.query).toBeCalledWith(expectedQuery, expectedArguments)
    })
  })

  describe('deleteUserToken', () => {
    test('deletes from repo', async () => {
      const userId = 'SomeUserjnsdf!"£123'
      const expectedQuery = 'DELETE FROM user_service_token ust WHERE ust.service_id = $1 AND ust.paceme_user_id = $2'
      const expectedArguments = [expectedServiceId, userId]
      fakePostgresPool.query.mockResolvedValue({ rowCount: 1, rows: [] })
      const result = await userServiceTokenRepository.deleteUserToken(userId)
      expect(result.isOk()).toBeTruthy()
      expect(fakePostgresPool.query).toBeCalledTimes(1)
      expect(fakePostgresPool.query).toBeCalledWith(expectedQuery, expectedArguments)
    })
  })

  describe('updateUserToken', () => {
    test('saves to pg', async () => {
      const userId = 'SomeUserjnsdf!"£123'
      const userToken = { whoamI: 'userToken', expires_in: 456 }
      const date = new Date(1920, 12, 12)
      fakeDateGenerator.mockReturnValue(date)
      fakePostgresPool.query.mockResolvedValue({ rowCount: 1, rows: [{ raw_token: userToken }] })
      const expectedQuery = 'UPDATE user_service_token SET raw_token = $3, last_updated = $4, expires_in = $5 WHERE service_id = $1 AND paceme_user_id = $2'
      const expectedArguments = [expectedServiceId, userId, userToken, date, userToken.expires_in]
      await userServiceTokenRepository.updateUserToken(userId, userToken as any)
      expect(fakePostgresPool.query).toBeCalledTimes(1)
      expect(fakePostgresPool.query).toBeCalledWith(expectedQuery, expectedArguments)
    })
  })

  describe('getTokensThatExpireBefore', () => {
    test('gets tokens', async () => {
      const date = new Date(1920, 12, 12)
      const userTokens = [
        { raw_token: { whoamI: 'userToken' }, paceme_user_id: 'SomeUserId' },
        { raw_token: { whoamI: 'userToken2' }, paceme_user_id: 'SomeUserId2' }
      ]
      fakePostgresPool.query.mockResolvedValue({ rowCount: 2, rows: userTokens })
      const getExpiringQuery = 'SELECT paceme_user_id, raw_token FROM user_service_token WHERE $1 = service_id AND $2 > last_updated + expires_in * interval \'1 second\''
      const getExpiringArguments = [expectedServiceId, date]
      const result = await userServiceTokenRepository.getTokensThatExpireBefore(date)
      expect(fakePostgresPool.query).toBeCalledTimes(1)
      expect(fakePostgresPool.query).toBeCalledWith(getExpiringQuery, getExpiringArguments)
      expect(result._unsafeUnwrap()).toBe(userTokens)
    })
  })
})
