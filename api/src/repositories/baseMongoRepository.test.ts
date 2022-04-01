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
      const result = await baseMongoRepo.getById(expectedDbName, {
        collectionName: expectedCollectionName,
        _id: expectedId
      }, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(fakeClient.db).toHaveBeenCalledWith(expectedDbName)
      expect(fakeDb.collection).toHaveBeenCalledWith(expectedCollectionName)
      expect(fakeCollection.findOne).toBeCalledTimes(1)
      expect(result.isOk()).toBeTruthy()
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
      const result = await baseMongoRepo.getById(expectedDbName, {
        collectionName: expectedCollectionName,
        _id: expectedId
      }, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(fakeClient.db).toHaveBeenCalledWith(expectedDbName)
      expect(fakeDb.collection).toHaveBeenCalledWith(expectedCollectionName)
      expect(fakeCollection.findOne).toBeCalledTimes(1)
      expect(result.isErr()).toBeTruthy()
    })

    test('getById :: connection failed :: returns error', async () => {
      const expectedId = '542c2b97bac0595474108b48'
      const fakeClient = {
        connect: jest.fn().mockRejectedValue(null)
      }
      const expectedDbName = 'dbname'
      const expectedCollectionName = 'collectionname'
      const result = await baseMongoRepo.getById(expectedDbName, {
        collectionName: expectedCollectionName,
        _id: expectedId
      }, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(result.isErr()).toBeTruthy()
    })

    test('getById :: malformed id :: returns error', async () => {
      const inputID = 'notarealid'
      const expectedDbName = 'dbname'
      const expectedCollectionName = 'collectionname'
      const result = await baseMongoRepo.getById(expectedDbName, {
        collectionName: expectedCollectionName,
        _id: inputID
      }, {} as unknown as MongoClient)
      expect(result.isErr()).toBeTruthy()
      expect(result._unsafeUnwrapErr()).toBe('Invalid ObjectId')
    })
  })

  describe('getOneByFilter', () => {
    test('getOneByFilter :: gets item from mongo :: returns it', async () => {
      const expectedId = '542c2b97bac0595474108b48'
      const expectedItem = { _id: expectedId, whoamid: 'testdata' }
      const expectedResponse = {
        next: jest.fn().mockResolvedValueOnce(expectedItem),
        hasNext: jest.fn().mockResolvedValue(false)
      }
      const fakeCollection = {
        find: jest.fn().mockResolvedValue(expectedResponse)
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
      const filter = {
        idField: expectedId
      }
      const result = await baseMongoRepo.getOneByFilter(expectedDbName,
        expectedCollectionName,
        filter, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(fakeClient.db).toHaveBeenCalledWith(expectedDbName)
      expect(fakeDb.collection).toHaveBeenCalledWith(expectedCollectionName)
      expect(fakeCollection.find).toBeCalledTimes(1)
      expect(fakeCollection.find.mock.calls[0][0]).toEqual(filter)
      expect(result.isOk()).toBeTruthy()
      expect(result._unsafeUnwrap()).toBe(expectedItem)
    })

    test('getOneByFilter :: no item :: returns error', async () => {
      const expectedId = '542c2b97bac0595474108b48'
      const expectedResponse = {
        next: jest.fn().mockResolvedValueOnce(null),
        hasNext: jest.fn().mockResolvedValue(false)
      }
      const fakeCollection = {
        find: jest.fn().mockResolvedValue(expectedResponse)
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
      const filter = {
        idField: expectedId
      }
      const result = await baseMongoRepo.getOneByFilter(expectedDbName,
        expectedCollectionName,
        filter, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(fakeClient.db).toHaveBeenCalledWith(expectedDbName)
      expect(fakeDb.collection).toHaveBeenCalledWith(expectedCollectionName)
      expect(fakeCollection.find).toBeCalledTimes(1)
      expect(fakeCollection.find.mock.calls[0][0]).toEqual(filter)
      expect(result.isErr()).toBeTruthy()
    })

    test('getOneByFilter :: connection failed :: returns error', async () => {
      const expectedId = '542c2b97bac0595474108b48'
      const fakeClient = {
        connect: jest.fn().mockRejectedValue(null)
      }
      const expectedDbName = 'dbname'
      const expectedCollectionName = 'collectionname'
      const result = await baseMongoRepo.getOneByFilter(expectedDbName,
        expectedCollectionName,
        {
          idField: expectedId
        }, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(result.isErr()).toBeTruthy()
    })

    test('getOneByFilter :: multiple items :: returns error', async () => {
      const expectedId = '542c2b97bac0595474108b48'
      const expectedItem = { _id: expectedId, whoamid: 'testdata' }
      const expectedResponse = {
        next: jest.fn().mockResolvedValueOnce(expectedItem),
        hasNext: jest.fn().mockResolvedValue(true)
      }
      const fakeCollection = {
        find: jest.fn().mockResolvedValue(expectedResponse)
      }
      const fakeDb = {
        collection: jest.fn().mockReturnValue(fakeCollection)
      }
      const fakeClient = {
        connect: jest.fn().mockResolvedValue(this),
        db: jest.fn().mockReturnValue(fakeDb)
      }
      const filter = {
        idField: expectedId
      }
      const expectedDbName = 'dbname'
      const expectedCollectionName = 'collectionname'
      const result = await baseMongoRepo.getOneByFilter(expectedDbName,
        expectedCollectionName,
        filter
        , fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(fakeClient.db).toHaveBeenCalledWith(expectedDbName)
      expect(fakeDb.collection).toHaveBeenCalledWith(expectedCollectionName)
      expect(fakeCollection.find).toBeCalledTimes(1)
      expect(fakeCollection.find.mock.calls[0][0]).toEqual(filter)
      expect(result.isErr()).toBeTruthy()
      expect(result._unsafeUnwrapErr()).toBe('Multiple objects')
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

    test('given item with _id :: strips and creates new item, returns with new id', async () => {
      const expectedDbName = 'SomeDbName'
      const expectedCollectionName = 'SomeCollectionName'
      const wantedInputItem = { whoami: 'inputItem' }
      const inputItem = { _id: '6244ac21e1b731b1b967af92', ...wantedInputItem }
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
      expect(fakeCollection.insertOne.mock.calls[0][0]).toEqual(wantedInputItem)
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
      expect(result.isErr()).toBeTruthy()
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

  describe('replaceOneByFilter', () => {
    test('happy path :: given item, passes to mongo', async () => {
      const expectedDbName = 'SomeDbName'
      const expectedCollectionName = 'SomeCollectionName'
      const inputItem = { whoami: 'inputItem' }
      const inputFilter = { filterOne: 'something', filterTwo: 'somethingElse' }
      const upsertedId = '542c2b97bac0595474108b48'
      const fakeCollection = {
        replaceOne: jest.fn().mockResolvedValue({ upsertedId, modifiedCount: 1 })
      }
      const fakeDb = {
        collection: jest.fn().mockReturnValue(fakeCollection)
      }
      const fakeClient = {
        connect: jest.fn().mockResolvedValue(this),
        db: jest.fn().mockReturnValue(fakeDb)
      }
      const result = await baseMongoRepo.replaceOneByFilter(expectedDbName, expectedCollectionName, inputFilter, inputItem, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(fakeClient.db).toHaveBeenCalledWith(expectedDbName)
      expect(fakeDb.collection).toHaveBeenCalledWith(expectedCollectionName)
      expect(fakeCollection.replaceOne).toBeCalledTimes(1)
      expect(fakeCollection.replaceOne).toHaveBeenCalledWith(inputFilter, inputItem)
      expect(result.isOk()).toBeTruthy()
      expect(result._unsafeUnwrap()).toEqual({ ...inputItem, _id: upsertedId })
    })

    test('connection failed :: returns error', async () => {
      const fakeClient = {
        connect: jest.fn().mockRejectedValue(null)
      }
      const expectedDbName = 'SomeDbName'
      const expectedCollectionName = 'SomeCollectionName'
      const inputItem = { whoami: 'inputItem' }
      const inputFilter = { filterOne: 'something', filterTwo: 'somethingElse' }
      const result = await baseMongoRepo.replaceOneByFilter(expectedDbName, expectedCollectionName, inputFilter, inputItem, fakeClient as unknown as MongoClient)

      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(result.isErr()).toBeTruthy()
    })

    test('write error :: returns error', async () => {
      const expectedDbName = 'SomeDbName'
      const expectedCollectionName = 'SomeCollectionName'
      const inputItem = { whoami: 'inputItem' }
      const inputFilter = { filterOne: 'something', filterTwo: 'somethingElse' }
      const fakeCollection = {
        replaceOne: jest.fn().mockRejectedValue({ errmsg: 'Error message' } as unknown as WriteError)
      }
      const fakeDb = {
        collection: jest.fn().mockReturnValue(fakeCollection)
      }
      const fakeClient = {
        connect: jest.fn().mockResolvedValue(this),
        db: jest.fn().mockReturnValue(fakeDb)
      }
      const result = await baseMongoRepo.replaceOneByFilter(expectedDbName, expectedCollectionName, inputFilter, inputItem, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(fakeClient.db).toHaveBeenCalledWith(expectedDbName)
      expect(fakeDb.collection).toHaveBeenCalledWith(expectedCollectionName)
      expect(fakeCollection.replaceOne).toBeCalledTimes(1)
      expect(fakeCollection.replaceOne).toHaveBeenCalledWith(inputFilter, inputItem)
      expect(result.isErr()).toBeTruthy()
    })

    const modifiedCounts = [0, 2, 45]

    test.each(modifiedCounts)('non 1 modified count :: return error', async (count) => {
      const expectedDbName = 'SomeDbName'
      const expectedCollectionName = 'SomeCollectionName'
      const inputItem = { whoami: 'inputItem' }
      const inputFilter = { filterOne: 'something', filterTwo: 'somethingElse' }
      const upsertedId = '542c2b97bac0595474108b48'
      const fakeCollection = {
        replaceOne: jest.fn().mockResolvedValue({ upsertedId, modifiedCount: count })
      }
      const fakeDb = {
        collection: jest.fn().mockReturnValue(fakeCollection)
      }
      const fakeClient = {
        connect: jest.fn().mockResolvedValue(this),
        db: jest.fn().mockReturnValue(fakeDb)
      }
      const result = await baseMongoRepo.replaceOneByFilter(expectedDbName, expectedCollectionName, inputFilter, inputItem, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(fakeClient.db).toHaveBeenCalledWith(expectedDbName)
      expect(fakeDb.collection).toHaveBeenCalledWith(expectedCollectionName)
      expect(fakeCollection.replaceOne).toBeCalledTimes(1)
      expect(fakeCollection.replaceOne).toHaveBeenCalledWith(inputFilter, inputItem)
      expect(result.isErr()).toBeTruthy()
    })
  })

  describe('update', () => {
    test('happy path :: given item, updates in mongo', async () => {
      const expectedDbName = 'SomeDbName'
      const expectedCollectionName = 'SomeCollectionName'
      const updatedId = '542c2b97bac0595474108b48'
      const inputItem = { _id: updatedId, whoami: 'inputItem' }
      const returnedUpdateValues = { matchedCount: 1, modifiedCount: 1 }
      const fakeCollection = {
        updateOne: jest.fn().mockResolvedValue(returnedUpdateValues)
      }
      const fakeDb = {
        collection: jest.fn().mockReturnValue(fakeCollection)
      }
      const fakeClient = {
        connect: jest.fn().mockResolvedValue(this),
        db: jest.fn().mockReturnValue(fakeDb)
      }
      const result = await baseMongoRepo.updateById(expectedDbName, expectedCollectionName, inputItem, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(fakeClient.db).toHaveBeenCalledWith(expectedDbName)
      expect(fakeDb.collection).toHaveBeenCalledWith(expectedCollectionName)
      expect(fakeCollection.updateOne).toBeCalledTimes(1)
      expect(fakeCollection.updateOne.mock.calls[0][0]).toEqual({ _id: updatedId })
      expect(fakeCollection.updateOne.mock.calls[0][1]).toBe(inputItem)
      expect(result.isOk()).toBeTruthy()
    })

    test('connection failed :: returns error', async () => {
      const fakeClient = {
        connect: jest.fn().mockRejectedValue(null)
      }
      const expectedDbName = 'SomeDbName'
      const expectedCollectionName = 'SomeCollectionName'
      const updatedId = '542c2b97bac0595474108b48'
      const inputItem = { _id: updatedId, whoami: 'inputItem' }
      const result = await baseMongoRepo.updateById(expectedDbName, expectedCollectionName, inputItem, fakeClient as unknown as MongoClient)

      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(result.isErr())
    })

    test('no matched item :: returns error', async () => {
      const expectedDbName = 'SomeDbName'
      const expectedCollectionName = 'SomeCollectionName'
      const updatedId = '542c2b97bac0595474108b48'
      const inputItem = { _id: updatedId, whoami: 'inputItem' }
      const returnedUpdateValues = { matchedCount: 0, modifiedCount: 0 }
      const fakeCollection = {
        updateOne: jest.fn().mockResolvedValue(returnedUpdateValues)
      }
      const fakeDb = {
        collection: jest.fn().mockReturnValue(fakeCollection)
      }
      const fakeClient = {
        connect: jest.fn().mockResolvedValue(this),
        db: jest.fn().mockReturnValue(fakeDb)
      }
      const result = await baseMongoRepo.updateById(expectedDbName, expectedCollectionName, inputItem, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(fakeClient.db).toHaveBeenCalledWith(expectedDbName)
      expect(fakeDb.collection).toHaveBeenCalledWith(expectedCollectionName)
      expect(fakeCollection.updateOne).toBeCalledTimes(1)
      expect(fakeCollection.updateOne.mock.calls[0][0]).toEqual({ _id: updatedId })
      expect(fakeCollection.updateOne.mock.calls[0][1]).toBe(inputItem)
      expect(result.isErr()).toBeTruthy()
    })

    test('no matched item :: returns error', async () => {
      const expectedDbName = 'SomeDbName'
      const expectedCollectionName = 'SomeCollectionName'
      const updatedId = '542c2b97bac0595474108b48'
      const inputItem = { _id: updatedId, whoami: 'inputItem' }
      const returnedUpdateValues = { matchedCount: 1, modifiedCount: 0 }
      const fakeCollection = {
        updateOne: jest.fn().mockResolvedValue(returnedUpdateValues)
      }
      const fakeDb = {
        collection: jest.fn().mockReturnValue(fakeCollection)
      }
      const fakeClient = {
        connect: jest.fn().mockResolvedValue(this),
        db: jest.fn().mockReturnValue(fakeDb)
      }
      const result = await baseMongoRepo.updateById(expectedDbName, expectedCollectionName, inputItem, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(fakeClient.db).toHaveBeenCalledWith(expectedDbName)
      expect(fakeDb.collection).toHaveBeenCalledWith(expectedCollectionName)
      expect(fakeCollection.updateOne).toBeCalledTimes(1)
      expect(fakeCollection.updateOne.mock.calls[0][0]).toEqual({ _id: updatedId })
      expect(fakeCollection.updateOne.mock.calls[0][1]).toBe(inputItem)
      expect(result.isErr()).toBeTruthy()
    })

    test('invalid id :: returns error', async () => {
      const expectedDbName = 'SomeDbName'
      const expectedCollectionName = 'SomeCollectionName'
      const updatedId = 'InvalidId'
      const inputItem = { _id: updatedId, whoami: 'inputItem' }
      const returnedUpdateValues = { matchedCount: 1, modifiedCount: 1 }
      const fakeCollection = {
        updateOne: jest.fn().mockResolvedValue(returnedUpdateValues)
      }
      const fakeDb = {
        collection: jest.fn().mockReturnValue(fakeCollection)
      }
      const fakeClient = {
        connect: jest.fn().mockResolvedValue(this),
        db: jest.fn().mockReturnValue(fakeDb)
      }
      const result = await baseMongoRepo.updateById(expectedDbName, expectedCollectionName, inputItem, fakeClient as unknown as MongoClient)

      expect(result.isErr()).toBeTruthy()
    })
  })

  describe('deleteById', () => {
    test('deletes item from mongo', async () => {
      const expectedId = '542c2b97bac0595474108b48'
      const expectedResponse = {
        deletedCount: 1
      }
      const fakeCollection = {
        deleteOne: jest.fn().mockResolvedValue(expectedResponse)
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
      const result = await baseMongoRepo.deleteById(expectedDbName, {
        collectionName: expectedCollectionName,
        _id: expectedId
      }, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(fakeClient.db).toHaveBeenCalledWith(expectedDbName)
      expect(fakeDb.collection).toHaveBeenCalledWith(expectedCollectionName)
      expect(fakeCollection.deleteOne).toBeCalledTimes(1)
      expect(fakeCollection.deleteOne.mock.calls[0]).toEqual([{ _id: expectedId }])
      expect(result.isOk()).toBeTruthy()
    })

    test('notihng to delete :: returns err', async () => {
      const expectedId = '542c2b97bac0595474108b48'
      const expectedResponse = {
        deletedCount: 0
      }
      const fakeCollection = {
        deleteOne: jest.fn().mockResolvedValue(expectedResponse)
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
      const result = await baseMongoRepo.deleteById(expectedDbName, {
        collectionName: expectedCollectionName,
        _id: expectedId
      }, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(fakeClient.db).toHaveBeenCalledWith(expectedDbName)
      expect(fakeDb.collection).toHaveBeenCalledWith(expectedCollectionName)
      expect(fakeCollection.deleteOne).toBeCalledTimes(1)
      expect(fakeCollection.deleteOne.mock.calls[0]).toEqual([{ _id: expectedId }])
      expect(result.isErr()).toBeTruthy()
    })

    test('connection failed :: returns error', async () => {
      const expectedId = '542c2b97bac0595474108b48'
      const fakeClient = {
        connect: jest.fn().mockRejectedValue(null)
      }
      const expectedDbName = 'dbname'
      const expectedCollectionName = 'collectionname'
      const result = await baseMongoRepo.deleteById(expectedDbName, {
        collectionName: expectedCollectionName,
        _id: expectedId
      }, fakeClient as unknown as MongoClient)
      expect(fakeClient.connect).toHaveBeenCalledTimes(1)
      expect(result.isErr()).toBeTruthy()
    })

    test('malformed id :: returns error', async () => {
      const inputID = 'notarealid'
      const expectedDbName = 'dbname'
      const expectedCollectionName = 'collectionname'
      const result = await baseMongoRepo.deleteById(expectedDbName, {
        collectionName: expectedCollectionName,
        _id: inputID
      }, {} as unknown as MongoClient)
      expect(result.isErr()).toBeTruthy()
      expect(result._unsafeUnwrapErr()).toBe('Invalid ObjectId')
    })
  })
})
