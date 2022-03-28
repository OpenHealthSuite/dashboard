import * as sinon from 'sinon'
import * as dynamodb from 'aws-sdk/clients/dynamodb'

// import { DeleteItemInput, GetItemInput, PutItemInput, ScanInput } from 'aws-sdk/clients/dynamodb'

import * as repository from './baseDynamoPartitionRepository'

test('baseDynamoRepository.create :: Overall Happy Test :: Creates new item', async () => {
  const testTableName = 'TESTTABLE'

  const expectedId = '123TESTEXPECTEDID'
  const expectedUserId = '456EXPECTEDUSERID'
  const expectedName = 'NAMEINPUT'
  const expectedActive = true

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

  const fakeDynamoClient = { put: sinon.stub().returns({ promise: sinon.stub().resolves() }) }

  // Act
  const result = await repository.create(testTableName, newItem, fakeDynamoClient as unknown as dynamodb.DocumentClient)

  // Assert
  expect(result).toEqual(newItem)
  fakeDynamoClient.put.calledOnceWithExactly(expectedParams)
})

test('baseDynamoRepository.getByPrimaryAndParentKey :: Overall Happy Test :: Gets item and returns it ', async () => {
  const testTableName = 'TESTTABLE'

  const expectedId = '123TESTEXPECTEDID'
  const expectedUserId = '456EXPECTEDUSERID'

  const expectedPartitionKey = 'userId'
  const expectedSortKey = 'id'

  const mockItem = { id: '123TESTEXPECTEDID', userId: '456EXPECTEDUSERID' }

  const expectedParams = {
    TableName: testTableName,
    Key: {
      id: expectedId,
      userId: expectedUserId
    }
  }

  const fakeDynamoClient = { get: sinon.stub().returns({ promise: sinon.stub().resolves({ Item: mockItem }) }) }

  // Act
  const result = await repository.getByPrimaryAndParentKey(testTableName, expectedPartitionKey, expectedUserId, expectedSortKey, expectedId, fakeDynamoClient as unknown as dynamodb.DocumentClient)

  // Assert

  expect(result).toEqual(mockItem)
  fakeDynamoClient.get.calledOnceWithExactly(expectedParams)
})

test('BaseDynamoRepository.update :: Overall Happy Test :: updates item ', async () => {
  const testTableName = 'TESTTABLE'

  const expectedUserId = '456EXPECTEDUSERID'
  const expectedName = 'EXPECTEDNAME9342'
  const expectedActive = true

  const input = { userId: expectedUserId, name: expectedName, active: expectedActive }

  const expectedUpdateParams = {
    TableName: testTableName,
    Item: input
  }

  const fakeDynamoClient = { put: sinon.stub().returns({ promise: sinon.stub().resolves() }) }

  // Act
  await repository.update(testTableName, input, fakeDynamoClient as unknown as dynamodb.DocumentClient)

  // Assert
  fakeDynamoClient.put.calledOnceWithExactly(expectedUpdateParams)
})

test('BaseDynamoRepository.delete :: Overall Happy Test :: deletes item ', async () => {
  const testTableName = 'TESTTABLE'

  const expectedId = '123TESTEXPECTEDID'
  const expectedUserId = '456EXPECTEDUSERID'

  const expectedPartitionKey = 'userId'
  const expectedSortKey = 'id'

  const expectedParams = {
    TableName: testTableName,
    Key: {
      id: expectedId,
      userId: expectedUserId
    }
  }

  const fakeDynamoClient = { delete: sinon.stub().returns({ promise: sinon.stub().resolves() }) }

  // Act

  await repository.deleteByPrimaryAndParentKey(testTableName, expectedPartitionKey, expectedUserId, expectedSortKey, expectedId, fakeDynamoClient as unknown as dynamodb.DocumentClient)

  // Assert
  fakeDynamoClient.delete.calledOnceWithExactly(expectedParams)
})
