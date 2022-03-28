import * as dynamodb from 'aws-sdk/clients/dynamodb'

const _docClient: dynamodb.DocumentClient = new dynamodb.DocumentClient({
  region: process.env.AWS_REGION ?? 'eu-west-2'
})

interface LooseKeyObject {
    [key: string]: string
}

export async function getAll<T> (tableName: string, partitionKey: string, expressionAttributeNames: LooseKeyObject, docClient: dynamodb.DocumentClient = _docClient): Promise<T[]> {
  const params = {
    TableName: tableName,
    ProjectionExpression: `${partitionKey}, ${Object.keys(expressionAttributeNames).join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames
  }

  const data = await docClient.scan(params).promise()
  return data.Items as T[]
}

export async function getAllByParentKey<T> (tableName: string, partitionKey: string, sortKey: string, partitionKeyValue: string, expressionAttributeNames: LooseKeyObject, docClient: dynamodb.DocumentClient = _docClient): Promise<T[]> {
  const params = {
    TableName: tableName,
    ProjectionExpression: `${partitionKey}, ${sortKey}, ${Object.keys(expressionAttributeNames).join(', ')}`,
    FilterExpression: `${partitionKey} = :requestedPartitionKey`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: {
      ':requestedPartitionKey': partitionKeyValue
    }
  }

  const data = await docClient.scan(params).promise()
  return data.Items as T[]
}

export async function getByPrimaryAndParentKey<T> (tableName: string, partitionKey: string, partitionKeyValue: string, sortKey: string, sortKeyValue: string, docClient: dynamodb.DocumentClient = _docClient): Promise<T> {
  const key: LooseKeyObject = {}
  key[partitionKey] = partitionKeyValue
  key[sortKey as string] = sortKeyValue

  const params = {
    TableName: tableName,
    Key: key
  }

  const data = await docClient.get(params).promise()
  return data.Item as T
}

export async function getFilteredItems<T> (tableName: string, partitionKey: string, expressionAttributeNames: LooseKeyObject, property: string, value: string | number | undefined, docClient: dynamodb.DocumentClient = _docClient) {
  const params = {
    TableName: tableName,
    ProjectionExpression: `${partitionKey}, ${Object.keys(expressionAttributeNames).join(', ')}`,
    FilterExpression: `${property} = :propertyValue`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: {
      ':propertyValue': value
    }
  }

  const data = await docClient.scan(params).promise()
  return data.Items as T[]
}

export async function getByPrimaryKey<T> (tableName: string, partitionKey: string, paritionKeyValue: string, docClient: dynamodb.DocumentClient = _docClient): Promise<T> {
  const key: LooseKeyObject = {}
  key[partitionKey] = paritionKeyValue

  const params = {
    TableName: tableName,
    Key: key
  }

  const data = await docClient.get(params).promise()
  return data.Item as T
}

export async function create<T> (tableName: string, newItem: T, docClient: dynamodb.DocumentClient = _docClient): Promise<T> {
  const params = {
    TableName: tableName,
    Item: newItem
  }

  await docClient.put(params).promise()
  return newItem
}

export async function update<T> (tableName: string, itemUpdate: T, docClient: dynamodb.DocumentClient = _docClient): Promise<void> {
  const updateParams = {
    TableName: tableName,
    Item: itemUpdate
  }

  await docClient.put(updateParams).promise()
}

export async function deleteByPrimaryKey (tableName: string, partitionKey: string, paritionKeyValue: string, docClient: dynamodb.DocumentClient = _docClient): Promise<void> {
  const key: LooseKeyObject = {}
  key[partitionKey] = paritionKeyValue
  const deleteParams = {
    TableName: tableName,
    Key: key
  }

  await docClient.delete(deleteParams).promise()
}

export async function deleteByPrimaryAndParentKey (tableName: string, partitionKey: string, paritionKeyValue: string, sortKey: string, sortKeyValue: string, docClient: dynamodb.DocumentClient = _docClient): Promise<void> {
  const key: LooseKeyObject = {}
  key[partitionKey] = paritionKeyValue
  key[sortKey as string] = sortKeyValue
  const deleteParams = {
    TableName: tableName,
    Key: key
  }

  await docClient.delete(deleteParams).promise()
}
