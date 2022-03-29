import { MongoClient, WriteError } from 'mongodb'
import * as baseMongoRepo from './baseMongoRepository'

describe('BaseMongoRepository', () => {
  describe('getById', () => {
    test('getById :: gets item from mongo :: returns it', async () => {
      const expectedId = '542c2b97bac0595474108b48'
      const expectedResponse = {
        _id: expectedId,
        whoamid: 'testdata'
      }
      const fakeCollection = {
        findOne: jest.fn().mockResolvedValue(expectedResponse)
      }
      const fakeDb = {
        collection: jest.fn().mockReturnValue(fakeCollection)
      }
      const fakeClient = {
        connect: jest.fn().mockResolvedValue(this),
        db: jest.fn().mockReturnValue(fakeDb)
      }
      const expectedDbName = 'dbname'
      const expectedCollectionName = 'collectionname'
      const result = await baseMongoRepo.getByKey(expectedDbName, {
        collectionName: expectedCollectionName,
        _id: expectedId
      }, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(fakeClient.db).toHaveBeenCalledWith(expectedDbName)
      expect(fakeDb.collection).toHaveBeenCalledWith(expectedCollectionName)
      expect(fakeCollection.findOne).toBeCalledTimes(1)
      expect(result.isOk())
      expect(result._unsafeUnwrap()).toBe(expectedResponse)
    })

    test('getById :: no item :: returns error', async () => {
      const expectedId = '542c2b97bac0595474108b48'
      const fakeCollection = {
        findOne: jest.fn().mockResolvedValue(null)
      }
      const fakeDb = {
        collection: jest.fn().mockReturnValue(fakeCollection)
      }
      const fakeClient = {
        connect: jest.fn().mockResolvedValue(this),
        db: jest.fn().mockReturnValue(fakeDb)
      }
      const expectedDbName = 'dbname'
      const expectedCollectionName = 'collectionname'
      const result = await baseMongoRepo.getByKey(expectedDbName, {
        collectionName: expectedCollectionName,
        _id: expectedId
      }, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(fakeClient.db).toHaveBeenCalledWith(expectedDbName)
      expect(fakeDb.collection).toHaveBeenCalledWith(expectedCollectionName)
      expect(fakeCollection.findOne).toBeCalledTimes(1)
      expect(result.isErr())
    })

    test('getById :: connection failed :: returns error', async () => {
      const expectedId = '542c2b97bac0595474108b48'
      const fakeClient = {
        connect: jest.fn().mockRejectedValue(null)
      }
      const expectedDbName = 'dbname'
      const expectedCollectionName = 'collectionname'
      const result = await baseMongoRepo.getByKey(expectedDbName, {
        collectionName: expectedCollectionName,
        _id: expectedId
      }, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(result.isErr())
    })

    test('getById :: malformed id :: returns error', async () => {
      const inputID = 'notarealid'
      const expectedDbName = 'dbname'
      const expectedCollectionName = 'collectionname'
      const result = await baseMongoRepo.getByKey(expectedDbName, {
        collectionName: expectedCollectionName,
        _id: inputID
      }, {} as unknown as MongoClient)
      expect(result.isErr())
      expect(result._unsafeUnwrapErr()).toBe('Invalid ObjectId')
    })
  })

  describe('create', () => {
    test('happy path :: given item, passes to mongo', async () => {
      const expectedDbName = 'SomeDbName'
      const expectedCollectionName = 'SomeCollectionName'
      const inputItem = { whoami: 'inputItem' }
      const insertedId = '542c2b97bac0595474108b48'
      const fakeCollection = {
        insertOne: jest.fn().mockResolvedValue({ insertedId })
      }
      const fakeDb = {
        collection: jest.fn().mockReturnValue(fakeCollection)
      }
      const fakeClient = {
        connect: jest.fn().mockResolvedValue(this),
        db: jest.fn().mockReturnValue(fakeDb)
      }
      const result = await baseMongoRepo.create(expectedDbName, expectedCollectionName, inputItem, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(fakeClient.db).toHaveBeenCalledWith(expectedDbName)
      expect(fakeDb.collection).toHaveBeenCalledWith(expectedCollectionName)
      expect(fakeCollection.insertOne).toBeCalledTimes(1)
      expect(fakeCollection.insertOne.mock.calls[0][0]).toBe(inputItem)
      expect(result.isOk()).toBeTruthy()
      expect(result._unsafeUnwrap()).toEqual({ ...inputItem, _id: insertedId })
    })

    test('connection failed :: returns error', async () => {
      const fakeClient = {
        connect: jest.fn().mockRejectedValue(null)
      }
      const expectedDbName = 'SomeDbName'
      const expectedCollectionName = 'SomeCollectionName'
      const inputItem = { whoami: 'inputItem' }
      const result = await baseMongoRepo.create(expectedDbName, expectedCollectionName, inputItem, fakeClient as unknown as MongoClient)

      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(result.isErr())
    })

    test('write error :: returns error', async () => {
      const expectedDbName = 'SomeDbName'
      const expectedCollectionName = 'SomeCollectionName'
      const inputItem = { whoami: 'inputItem' }
      const fakeCollection = {
        insertOne: jest.fn().mockRejectedValue({ errmsg: 'Error message' } as unknown as WriteError)
      }
      const fakeDb = {
        collection: jest.fn().mockReturnValue(fakeCollection)
      }
      const fakeClient = {
        connect: jest.fn().mockResolvedValue(this),
        db: jest.fn().mockReturnValue(fakeDb)
      }
      const result = await baseMongoRepo.create(expectedDbName, expectedCollectionName, inputItem, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(fakeClient.db).toHaveBeenCalledWith(expectedDbName)
      expect(fakeDb.collection).toHaveBeenCalledWith(expectedCollectionName)
      expect(fakeCollection.insertOne).toBeCalledTimes(1)
      expect(fakeCollection.insertOne.mock.calls[0][0]).toBe(inputItem)
      expect(result.isErr()).toBeTruthy()
    })
  })
})
