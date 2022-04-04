import { UserServiceTokenRepository } from './userServiceTokenRepository'
import { Pool } from 'pg'

const expectedServiceId = 'someservicename'

describe('UserSettingsRepository', () => {
  let fakePostgresPool = {
    query: jest.fn()
  }

  let userServiceTokenRepository = new UserServiceTokenRepository(
    expectedServiceId,
    fakePostgresPool as unknown as Pool
  )

  beforeEach(() => {
    fakePostgresPool = {
      query: jest.fn()
    }
    userServiceTokenRepository = new UserServiceTokenRepository(
      expectedServiceId,
      fakePostgresPool as unknown as Pool
    )
  })

  describe('createUserToken', () => {
    test('saves to pg', async () => {
      const userId = 'SomeUserjnsdf!"£123'
      const userToken = { whoamI: 'userToken' }
      fakePostgresPool.query.mockResolvedValue({ rowCount: 1, rows: [userToken] })
      const expectedQuery = 'INSERT INTO user_service_token (service_id, user_id, token) VALUES ($1, $2, $3)'
      const expectedArguments = [expectedServiceId, userId, userToken]
      await userServiceTokenRepository.createUserToken(userId, userToken)
      expect(fakePostgresPool.query).toBeCalledTimes(1)
      expect(fakePostgresPool.query).toBeCalledWith(expectedQuery, expectedArguments)
    })
  })

  describe('getUserToken', () => {
    test('gets from repo', async () => {
      const userId = 'SomeUserjnsdf!"£123'
      const userToken = { whoamI: 'userToken' }
      const expectedQuery = 'SELECT token FROM user_service_token ust WHERE ust.service_id = $1 AND ust.user_id = $2'
      const expectedArguments = [expectedServiceId, userId]
      fakePostgresPool.query.mockResolvedValue({ rowCount: 1, rows: [{ token: userToken }] })
      const result = await userServiceTokenRepository.getUserToken(userId)
      expect(result.isOk()).toBeTruthy()
      expect(result._unsafeUnwrap()).toBe(userToken)
      expect(fakePostgresPool.query).toBeCalledTimes(1)
      expect(fakePostgresPool.query).toBeCalledWith(expectedQuery, expectedArguments)
    })
    test('nothing found :: returns null', async () => {
      const userId = 'SomeUserjnsdf!"£123'
      const expectedQuery = 'SELECT token FROM user_service_token ust WHERE ust.service_id = $1 AND ust.user_id = $2'
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
    test('gets from repo', async () => {
      const userId = 'SomeUserjnsdf!"£123'
      const expectedQuery = 'DELETE FROM user_service_token ust WHERE ust.service_id = $1 AND ust.user_id = $2'
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
      const userToken = { whoamI: 'userToken' }
      fakePostgresPool.query.mockResolvedValue({ rowCount: 1, rows: [{ token: userToken }] })
      const expectedQuery = 'UPDATE user_service_token SET token = $3 WHERE service_id = $1 AND user_id = $2'
      const expectedArguments = [expectedServiceId, userId, userToken]
      await userServiceTokenRepository.updateUserToken(userId, userToken)
      expect(fakePostgresPool.query).toBeCalledTimes(1)
      expect(fakePostgresPool.query).toBeCalledWith(expectedQuery, expectedArguments)
    })
  })
})
