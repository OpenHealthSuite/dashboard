import { UserServiceTokenRepository } from './userServiceTokenRepository'
import { IBaseMongoRepository } from './baseMongoRepository'
import { ok } from 'neverthrow'
import { Pool } from 'pg'

const expectedDbName = 'user'
const expectedCollectionName = 'token'
const expectedServiceId = 'someservicename'

describe('UserSettingsRepository', () => {
  let fakeMongoRepo = {
    getOneByFilter: jest.fn(),
    replaceOneByFilter: jest.fn(),
    update: jest.fn()
  }

  let fakePostgresPool = {
    query: jest.fn()
  }

  let userServiceTokenRepository = new UserServiceTokenRepository(
    expectedServiceId,
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
    userServiceTokenRepository = new UserServiceTokenRepository(
      expectedServiceId,
      fakeMongoRepo as unknown as IBaseMongoRepository,
      fakePostgresPool as unknown as Pool
    )
  })
  describe('getUserToken', () => {
    test('no cache value :: gets from repo, saves to cache', async () => {
      const userId = 'SomeUserjnsdf!"£123'
      const userToken = { whoamI: 'userToken' }
      fakeMongoRepo.getOneByFilter.mockResolvedValue(ok({ token: userToken }))
      const result = await userServiceTokenRepository.getUserToken(userId)
      expect(result).toBe(userToken)
      expect(fakeMongoRepo.getOneByFilter).toBeCalledTimes(1)
      expect(fakeMongoRepo.getOneByFilter).toBeCalledWith(expectedDbName, expectedCollectionName, { serviceId: expectedServiceId, userId })
    })
  })

  describe('updateUserToken', () => {
    test('saves to mongo, then mongo value to cache', async () => {
      const userId = 'SomeUserjnsdf!"£123'
      const userToken = { whoamI: 'userToken' }
      fakeMongoRepo.replaceOneByFilter.mockResolvedValue(ok({ _id: '542c2b97bac0595474108b48', token: userToken }))
      await userServiceTokenRepository.updateUserToken(userId, userToken)
      expect(fakeMongoRepo.replaceOneByFilter).toBeCalledTimes(1)
      expect(fakeMongoRepo.replaceOneByFilter).toBeCalledWith(expectedDbName, expectedCollectionName, { serviceId: expectedServiceId, userId }, { userId, serviceId: expectedServiceId, token: userToken })
    })
  })
})
