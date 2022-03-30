import { MongoClient, ObjectId } from 'mongodb'
import { err, ok, Result } from 'neverthrow'

export async function getById<T> (dbname: string, { collectionName, _id }: { collectionName: string, _id: string }, client: MongoClient): Promise<Result<T, string>> {
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

export async function create<T> (dbname: string, collectionName: string, inputItem: T, client: MongoClient): Promise<Result<T, string>> {
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

interface IDocumentWithId {
  _id: ObjectId | string
  [key: string]: any
}

export async function updateById (dbname: string, collectionName: string, inputItem: IDocumentWithId, client: MongoClient): Promise<Result<null, string>> {
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

export async function deleteById (dbname: string, { collectionName, _id }: { collectionName: string, _id: string }, client: MongoClient): Promise<Result<null, string>> {
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
