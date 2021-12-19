import { BaseDynamoRepository } from './baseDynamoRepository'

interface LooseKeyObject {
    [key: string]: string
}

export abstract class BaseDynamoPartitionRepository<T> extends BaseDynamoRepository {
    private readonly _tableName: string;
    private readonly _expressionAttributeNames = {}
    private readonly _partitionKey: string

    constructor (tableName: string, paritionKey: string, expressionAttributeNames: {}) {
      super()
      this._tableName = tableName
      this._partitionKey = paritionKey
      this._expressionAttributeNames = expressionAttributeNames
    }

    protected async getAll (): Promise<T[]> {
      const params = {
        TableName: this._tableName,
        ProjectionExpression: `${this._partitionKey}, ${Object.keys(this._expressionAttributeNames).join(', ')}`,
        ExpressionAttributeNames: this._expressionAttributeNames
      }

      const data = await this._docClient.scan(params).promise()
      return data.Items as T[]
    }

    protected async getFilteredItems (property: string, value: string | number | undefined) {
      const params = {
        TableName: this._tableName,
        ProjectionExpression: `${this._partitionKey}, ${Object.keys(this._expressionAttributeNames).join(', ')}`,
        FilterExpression: `${property} = :propertyValue`,
        ExpressionAttributeNames: this._expressionAttributeNames,
        ExpressionAttributeValues: {
          ':propertyValue': value
        }
      }

      const data = await this._docClient.scan(params).promise()
      return data.Items as T[]
    }

    protected async getByPartitionKey (paritionKey: string): Promise<T> {
      const key: LooseKeyObject = {}
      key[this._partitionKey] = paritionKey

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

    protected async deleteByPartitionKey (paritionKey: string): Promise<void> {
      const key: LooseKeyObject = {}
      key[this._partitionKey] = paritionKey
      const deleteParams = {
        TableName: this._tableName,
        Key: key
      }

      await this._docClient.delete(deleteParams).promise()
    }
}
