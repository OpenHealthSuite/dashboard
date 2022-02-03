import * as sinon from 'sinon'
import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'

import { DeleteItemInput, GetItemInput, PutItemInput, ScanInput } from 'aws-sdk/clients/dynamodb'

import { BaseDynamoPartitionSortRepository } from './baseDynamoPartitionSortRepository'

class FakeBaseDynamoRepository extends BaseDynamoPartitionSortRepository<{}> {
  public getAllByPartitionKey (partitionKey: string) {
    return super.getAllByPartitionKey(partitionKey)
  }

  public getByPartitionAndSortKeys (paritionKey: string, sortKey: string) {
    return super.getByPartitionAndSortKeys(paritionKey, sortKey)
  }

  public create (newItem: {}) {
    return super.create(newItem)
  }

  public update (itemUpdate: {}) {
    return super.update(itemUpdate)
  }

  public deleteByPartitionAndSortKey (paritionKey: string, sortKey: string) {
    return super.deleteByPartitionAndSortKey(paritionKey, sortKey)
  }
}

test('baseDynamoRepository.create :: Overall Happy Test :: Creates new item', async () => {
  const testTableName = 'TESTTABLE'

  const expectedId = '123TESTEXPECTEDID'
  const expectedUserId = '456EXPECTEDUSERID'
  const expectedName = 'NAMEINPUT'
  const expectedActive = true

  const expectedPartitionKey = 'userId'
  const expectedSortKey = 'id'

  const expectedExpressionAttributes = {
    '#nm': 'name',
    '#active': 'active'
  }

  const newItem = {
    id: expectedId,
    userId: expectedUserId,
    name: expectedName,
    active: expectedActive
  }
  const expectedParams = {
    TableName: testTableName,
    Item: newItem
  }

  AWSMock.setSDKInstance(AWS)
  AWSMock.mock('DynamoDB.DocumentClient', 'put', (params: PutItemInput, callback: Function) => {
    expect(params).toEqual(expectedParams)
    callback(null, {})
  })

  const repository = new FakeBaseDynamoRepository(testTableName, expectedPartitionKey, expectedSortKey, expectedExpressionAttributes)

  // Act
  const result = await repository.create(newItem)

  // Assert

  expect(result).toEqual(newItem)
  AWSMock.restore('DynamoDB.DocumentClient')
  sinon.restore()
})

test('baseDynamoRepository.getAllByPartitionKey :: Overall Happy Test :: Gets and returns items ', async () => {
  const testTableName = 'TESTTABLE'

  const expectedUserId = '456EXPECTEDUSERID'

  const mockItems = [{ id: '123TESTEXPECTEDID', userId: expectedUserId }]

  const expectedPartitionKey = 'userId'
  const expectedSortKey = 'id'

  const expectedExpressionAttributes = {
    '#nm': 'name',
    '#active': 'active'
  }

  const expectedParams = {
    TableName: testTableName,
    ProjectionExpression: 'userId, id, #nm, #active',
    FilterExpression: 'userId = :requestedPartitionKey',
    ExpressionAttributeNames: expectedExpressionAttributes,
    ExpressionAttributeValues: {
      ':requestedPartitionKey': expectedUserId
    }
  }

  AWSMock.setSDKInstance(AWS)
  AWSMock.mock('DynamoDB.DocumentClient', 'scan', (params: ScanInput, callback: Function) => {
    expect(params).toEqual(expectedParams)
    callback(null, { Items: mockItems })
  })

  const repository = new FakeBaseDynamoRepository(testTableName, expectedPartitionKey, expectedSortKey, expectedExpressionAttributes)

  // Act
  const result = await repository.getAllByPartitionKey(expectedUserId)

  // Assert

  expect(result).toEqual(mockItems)
  AWSMock.restore('DynamoDB.DocumentClient')
  sinon.restore()
})

test('baseDynamoRepository.getByPartitionAndSortKeys :: Overall Happy Test :: Gets item and returns it ', async () => {
  const testTableName = 'TESTTABLE'

  const expectedId = '123TESTEXPECTEDID'
  const expectedUserId = '456EXPECTEDUSERID'

  const expectedPartitionKey = 'userId'
  const expectedSortKey = 'id'

  const expectedExpressionAttributes = {
    '#nm': 'name',
    '#active': 'active'
  }

  const mockItem = { id: '123TESTEXPECTEDID', userId: '456EXPECTEDUSERID' }

  const expectedParams = {
    TableName: testTableName,
    Key: {
      id: expectedId,
      userId: expectedUserId
    }
  }

  AWSMock.setSDKInstance(AWS)
  AWSMock.mock('DynamoDB.DocumentClient', 'get', (params: GetItemInput, callback: Function) => {
    expect(params).toEqual(expectedParams)
    callback(null, { Item: mockItem })
  })

  const repository = new FakeBaseDynamoRepository(testTableName, expectedPartitionKey, expectedSortKey, expectedExpressionAttributes)

  // Act
  const result = await repository.getByPartitionAndSortKeys(expectedUserId, expectedId)

  // Assert

  expect(result).toEqual(mockItem)
  AWSMock.restore('DynamoDB.DocumentClient')
  sinon.restore()
})

test('BaseDynamoRepository.update :: Overall Happy Test :: updates item ', async () => {
  const testTableName = 'TESTTABLE'

  const expectedId = '123TESTEXPECTEDID'
  const expectedUserId = '456EXPECTEDUSERID'
  const expectedName = 'EXPECTEDNAME9342'
  const expectedActive = true

  const expectedPartitionKey = 'userId'
  const expectedSortKey = 'id'

  const expectedExpressionAttributes = {
    '#nm': 'name',
    '#active': 'active'
  }

  const input = { id: expectedId, userId: expectedUserId, name: expectedName, active: expectedActive }

  const expectedUpdateParams = {
    TableName: testTableName,
    Item: input
  }

  AWSMock.setSDKInstance(AWS)
  AWSMock.mock('DynamoDB.DocumentClient', 'put', (params: PutItemInput, callback: Function) => {
    expect(params).toEqual(expectedUpdateParams)
    callback(null, {})
  })

  const repository = new FakeBaseDynamoRepository(testTableName, expectedPartitionKey, expectedSortKey, expectedExpressionAttributes)

  // Act
  await repository.update(input)

  // Assert
  AWSMock.restore('DynamoDB.DocumentClient')
  sinon.restore()
})

test('BaseDynamoRepository.delete :: Overall Happy Test :: deletes item ', async () => {
  const testTableName = 'TESTTABLE'

  const expectedId = '123TESTEXPECTEDID'
  const expectedUserId = '456EXPECTEDUSERID'

  const expectedPartitionKey = 'userId'
  const expectedSortKey = 'id'

  const expectedExpressionAttributes = {
    '#nm': 'name',
    '#active': 'active'
  }

  const expectedParams = {
    TableName: testTableName,
    Key: {
      id: expectedId,
      userId: expectedUserId
    }
  }

  AWSMock.setSDKInstance(AWS)
  AWSMock.mock('DynamoDB.DocumentClient', 'delete', (params: DeleteItemInput, callback: Function) => {
    expect(params).toEqual(expectedParams)
    callback(null, {})
  })

  const repository = new FakeBaseDynamoRepository(testTableName, expectedPartitionKey, expectedSortKey, expectedExpressionAttributes)

  // Act
  await repository.deleteByPartitionAndSortKey(expectedUserId, expectedId)

  // Assert
  AWSMock.restore('DynamoDB.DocumentClient')
  sinon.restore()
})
