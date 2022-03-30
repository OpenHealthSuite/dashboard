import { MongoClient, ObjectId } from 'mongodb'
import { err, ok, Result } from 'neverthrow'

export async function getByKey<T> (dbname: string, { collectionName, _id }: { collectionName: string, _id: string }, client: MongoClient): Promise<Result<T, string>> {
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

export async function update (dbname: string, collectionName: string, inputItem: IDocumentWithId, client: MongoClient): Promise<Result<null, string>> {
  try {
    await client.connect()
  } catch {
    return err('Failed to connect to mongo')
  }
  const db = client.db(dbname)
  const collection = db.collection(collectionName)
  try {
    await collection.updateOne({ _id: inputItem._id }, inputItem)
    return ok(null)
  } catch (error: any) {
    return err(`Error writing to Mongo: ${error.errmsg}`)
  }
}
