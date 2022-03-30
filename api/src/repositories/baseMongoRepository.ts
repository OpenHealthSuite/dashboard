import { Document, MongoClient, ObjectId } from 'mongodb'
import { err, ok, Result } from 'neverthrow'

const mongoClient = new MongoClient(process.env.MONGO_CONNECTION_STRING || 'mongodb://user:pass@localhost:27017/')
interface IDocumentWithId {
  _id: ObjectId | string
  [key: string]: any
}
export interface IBaseMongoRepository {
  getById:<T> (dbname: string, { collectionName, _id }: { collectionName: string, _id: string }) => Promise<Result<T, string>>,
  getOneByFilter:<T> (dbname: string, collectionName: string, filter: Document) => Promise<Result<T, string>>,
  create:<T> (dbname: string, collectionName: string, inputItem: T) => Promise<Result<T, string>>,
  updateById: (dbname: string, collectionName: string, inputItem: IDocumentWithId) => Promise<Result<null, string>>,
  deleteById: (dbname: string, { collectionName, _id }: { collectionName: string, _id: string }) => Promise<Result<null, string>>
}

export async function getById<T> (dbname: string, { collectionName, _id }: { collectionName: string, _id: string }, client: MongoClient = mongoClient): Promise<Result<T, string>> {
  if (!ObjectId.isValid(_id)) {
    return err('Invalid ObjectId')
  }
  try {
    await client.connect()
  } catch {
    return err('Failed to connect to mongo')
  }
  const db = client.db(dbname)
  const collection = db.collection(collectionName)
  const result = await collection.findOne<T>({ _id })
  return result !== null ? ok(result) : err('Not found')
}

export async function getOneByFilter<T> (dbname: string, collectionName: string, filter: Document, client: MongoClient = mongoClient): Promise<Result<T, string>> {
  try {
    await client.connect()
  } catch {
    return err('Failed to connect to mongo')
  }
  const db = client.db(dbname)
  const collection = db.collection(collectionName)
  const cursor = await collection.find<T>(filter)
  const result = await cursor.next()
  if (result !== null && await cursor.hasNext()) {
    return err('Multiple objects')
  }
  return result !== null ? ok(result) : err('Not found')
}

export async function create<T> (dbname: string, collectionName: string, inputItem: T, client: MongoClient = mongoClient): Promise<Result<T, string>> {
  try {
    await client.connect()
  } catch {
    return err('Failed to connect to mongo')
  }
  const db = client.db(dbname)
  const collection = db.collection(collectionName)
  delete (inputItem as any)._id
  try {
    const result = await collection.insertOne(inputItem)
    return ok({ _id: result.insertedId, ...inputItem })
  } catch (error: any) {
    return err(`Error writing to Mongo: ${error.errmsg}`)
  }
}

export async function updateById (dbname: string, collectionName: string, inputItem: IDocumentWithId, client: MongoClient = mongoClient): Promise<Result<null, string>> {
  if (!ObjectId.isValid(inputItem._id)) {
    return err('Invalid ObjectId')
  }
  try {
    await client.connect()
  } catch {
    return err('Failed to connect to mongo')
  }
  const db = client.db(dbname)
  const collection = db.collection(collectionName)
  try {
    const result = await collection.updateOne({ _id: inputItem._id }, inputItem)
    if (result.modifiedCount === 0 || result.matchedCount === 0) {
      return err(`Error writing to Mongo: ${JSON.stringify(result)}`)
    }
    return ok(null)
  } catch (error: any) {
    return err(`Error writing to Mongo: ${error.errmsg}`)
  }
}

export async function deleteById (dbname: string, { collectionName, _id }: { collectionName: string, _id: string }, client: MongoClient = mongoClient): Promise<Result<null, string>> {
  if (!ObjectId.isValid(_id)) {
    return err('Invalid ObjectId')
  }
  try {
    await client.connect()
  } catch {
    return err('Failed to connect to mongo')
  }
  const db = client.db(dbname)
  const collection = db.collection(collectionName)
  const result = await collection.deleteOne({ _id })
  return result.deletedCount === 1 ? ok(null) : err(`Deleted ${result.deletedCount} items`)
}
