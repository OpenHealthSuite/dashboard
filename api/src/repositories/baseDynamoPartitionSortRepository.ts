import { BaseDynamoRepository } from './baseDynamoRepository'

interface LooseKeyObject {
    [key: string]: string
}

export abstract class BaseDynamoPartitionSortRepository<T> extends BaseDynamoRepository {
    private readonly _tableName: string;
    private readonly _expressionAttributeNames = {}
    private readonly _partitionKey: string
    private readonly _sortKey: string

    constructor (tableName: string, paritionKey: string, sortKey: string, expressionAttributeNames: {}) {
      super()
      this._tableName = tableName
      this._partitionKey = paritionKey
      this._sortKey = sortKey
      this._expressionAttributeNames = expressionAttributeNames
    }

    protected async getAllByPartitionKey (partitionKey: string): Promise<T[]> {
      const params = {
        TableName: this._tableName,
        ProjectionExpression: `${this._partitionKey}, ${this._sortKey}, ${Object.keys(this._expressionAttributeNames).join(', ')}`,
        FilterExpression: `${this._partitionKey} = :requestedPartitionKey`,
        ExpressionAttributeNames: this._expressionAttributeNames,
        ExpressionAttributeValues: {
          ':requestedPartitionKey': partitionKey
        }
      }

      const data = await this._docClient.scan(params).promise()
      return data.Items as T[]
    }

    protected async getByPartitionAndSortKeys (paritionKey: string, sortKey: string): Promise<T> {
      const key: LooseKeyObject = {}
      key[this._partitionKey] = paritionKey
      key[this._sortKey as string] = sortKey

      const params = {
        TableName: this._tableName,
        Key: key
      }

      const data = await this._docClient.get(params).promise()
      return data.Item as T
    }

    protected async create (newItem: T): Promise<T> {
      const params = {
        TableName: this._tableName,
        Item: newItem
      }

      await this._docClient.put(params).promise()
      return newItem
    }

    protected async update (itemUpdate: T): Promise<void> {
      const updateParams = {
        TableName: this._tableName,
        Item: itemUpdate
      }

      await this._docClient.put(updateParams).promise()
    }

    protected async deleteByPartitionAndSortKey (paritionKey: string, sortKey: string): Promise<void> {
      const key: LooseKeyObject = {}
      key[this._partitionKey] = paritionKey
      key[this._sortKey as string] = sortKey
      const deleteParams = {
        TableName: this._tableName,
        Key: key
      }

      await this._docClient.delete(deleteParams).promise()
    }
}
