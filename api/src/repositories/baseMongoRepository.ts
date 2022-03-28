import { MongoClient, ObjectId } from 'mongodb'
import { err, ok, Result } from 'neverthrow'

export async function getByKey<T> (dbname: string, { collectionName, _id }: { collectionName: string, _id: string }, client: MongoClient): Promise<Result<T, string>> {
  // Not a massive fan of this, but it'll do
  try {
    new ObjectId(_id).toString()
  } catch {
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
