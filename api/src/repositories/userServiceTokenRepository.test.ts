import { UserServiceTokenRepository } from './userServiceTokenRepository'
import { IBaseMongoRepository } from './baseMongoRepository'
import { IGenericCache } from '../caches/GenericCache'
import { ok } from 'neverthrow'

const expectedDbName = 'user'
const expectedCollectionName = 'token'
const expectedServiceId = 'someservicename'
const expectedCacheKey = `${expectedDbName}:${expectedCollectionName}:${expectedServiceId}`

describe('UserSettingsRepository', () => {
  let fakeMongoRepo = {
    getOneByFilter: jest.fn(),
    replaceOneByFilter: jest.fn(),
    update: jest.fn()
  }
  let fakeCache = {
    GetByKey: jest.fn(),
    SaveOnKey: jest.fn()
  }

  let userServiceTokenRepository = new UserServiceTokenRepository(
    expectedServiceId,
    fakeMongoRepo as unknown as IBaseMongoRepository,
    fakeCache as unknown as IGenericCache
  )

  beforeEach(() => {
    fakeMongoRepo = {
      getOneByFilter: jest.fn(),
      replaceOneByFilter: jest.fn(),
      update: jest.fn()
    }
    fakeCache = {
      GetByKey: jest.fn(),
      SaveOnKey: jest.fn()
    }
    userServiceTokenRepository = new UserServiceTokenRepository(
      expectedServiceId,
      fakeMongoRepo as unknown as IBaseMongoRepository,
      fakeCache as unknown as IGenericCache
    )
  })
  describe('getUserToken', () => {
    test('Has cache value :: returns cache value', async () => {
      const userId = 'SomeUserjnsdf!"£123'
      const userToken = { whoamI: 'userToken' }
      fakeCache.GetByKey.mockResolvedValue({ value: userToken })
      const result = await userServiceTokenRepository.getUserToken(userId)
      expect(result).toBe(userToken)
      expect(fakeCache.GetByKey).toBeCalledTimes(1)
      expect(fakeCache.GetByKey).toBeCalledWith(`${expectedCacheKey}:${userId}`)
      expect(fakeMongoRepo.getOneByFilter).toBeCalledTimes(0)
      expect(fakeCache.SaveOnKey).toBeCalledTimes(0)
    })
    test('no cache value :: gets from repo, saves to cache', async () => {
      const userId = 'SomeUserjnsdf!"£123'
      const userToken = { whoamI: 'userToken' }
      fakeCache.GetByKey.mockResolvedValue(undefined)
      fakeMongoRepo.getOneByFilter.mockResolvedValue(ok({ token: userToken }))
      const result = await userServiceTokenRepository.getUserToken(userId)
      expect(result).toBe(userToken)
      expect(fakeCache.GetByKey).toBeCalledTimes(1)
      expect(fakeCache.GetByKey).toBeCalledWith(`${expectedCacheKey}:${userId}`)
      expect(fakeMongoRepo.getOneByFilter).toBeCalledTimes(1)
      expect(fakeMongoRepo.getOneByFilter).toBeCalledWith(expectedDbName, expectedCollectionName, { serviceId: expectedServiceId, userId })
      expect(fakeCache.SaveOnKey).toBeCalledTimes(1)
      expect(fakeCache.SaveOnKey).toBeCalledWith(`${expectedCacheKey}:${userId}`, userToken)
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
      expect(fakeCache.SaveOnKey).toBeCalledTimes(1)
      expect(fakeCache.SaveOnKey).toBeCalledWith(`${expectedCacheKey}:${userId}`, userToken)
    })
  })
})
