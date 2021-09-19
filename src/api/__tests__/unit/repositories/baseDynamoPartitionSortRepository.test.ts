import * as test from "tape";

import * as sinon from "sinon";
import * as _ from "lodash";

import * as AWSMock from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';

import { DeleteItemInput, GetItemInput, PutItemInput, ScanInput } from "aws-sdk/clients/dynamodb";

import { BaseDynamoPartitionSortRepository } from "../../../src/repositories/baseDynamoPartitionSortRepository";

class FakeBaseDynamoRepository extends BaseDynamoPartitionSortRepository<{}> {
    constructor(tableName: string, paritionKey: string, sortKey: string, expressionAttributeNames: {}) {
        super(tableName, paritionKey, sortKey, expressionAttributeNames)
    }
    public getAllByPartitionKey(partitionKey: string) {
        return super.getAllByPartitionKey(partitionKey);
    }
    public getByPartitionAndSortKeys(paritionKey: string, sortKey: string) {
        return super.getByPartitionAndSortKeys(paritionKey, sortKey);
    }
    public create(newItem: {}) {
        return super.create(newItem);
    }
    public update(itemUpdate: {}) {
        return super.update(itemUpdate);
    }
    public deleteByPartitionAndSortKey(paritionKey: string, sortKey: string) {
        return super.deleteByPartitionAndSortKey(paritionKey, sortKey);
    }
}

test('baseDynamoRepository.create :: Overall Happy Test :: Creates new item', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"
    const expectedName = "NAMEINPUT"
    const expectedActive = true

    const expectedPartitionKey = "userId"
    const expectedSortKey = "id"

    const expectedExpressionAttributes = {
        "#nm": "name",
        "#active": "active"
    }

    var newItem = {
        id: expectedId,
        userId: expectedUserId,
        name: expectedName,
        active: expectedActive
    }
    var expectedParams = {
        TableName: testTableName,
        Item: newItem
    }

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params: PutItemInput, callback: Function) => {
        t.deepLooseEqual(params, expectedParams);
        callback(null, {});
    })

    let repository = new FakeBaseDynamoRepository(testTableName, expectedPartitionKey, expectedSortKey, expectedExpressionAttributes)

    // Act
    const result = await repository.create(newItem);

    // Assert

    t.deepLooseEqual(result, newItem);
    t.end();
    AWSMock.restore('DynamoDB.DocumentClient');
    sinon.restore();
})

test('baseDynamoRepository.getAllByPartitionKey :: Overall Happy Test :: Gets and returns items ', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedUserId = "456EXPECTEDUSERID"

    const mockItems = [{ id: '123TESTEXPECTEDID', userId: expectedUserId }];

    const expectedPartitionKey = "userId"
    const expectedSortKey = "id"

    const expectedExpressionAttributes = {
        "#nm": "name",
        "#active": "active"
    }

    var expectedParams = {
        TableName: testTableName,
        ProjectionExpression: "userId, id, #nm, #active",
        FilterExpression: "userId = :requestedPartitionKey",
        ExpressionAttributeNames: expectedExpressionAttributes,
        ExpressionAttributeValues: {
            ":requestedPartitionKey": expectedUserId
        }
    }

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'scan', (params: ScanInput, callback: Function) => {
        t.deepLooseEqual(params, expectedParams);
        callback(null, { Items: mockItems });
    })

    let repository = new FakeBaseDynamoRepository(testTableName, expectedPartitionKey, expectedSortKey, expectedExpressionAttributes)

    // Act
    const result = await repository.getAllByPartitionKey(expectedUserId);

    // Assert

    t.deepLooseEqual(result, mockItems);
    t.end();
    AWSMock.restore('DynamoDB.DocumentClient');
    sinon.restore();
})

test('baseDynamoRepository.getByPartitionAndSortKeys :: Overall Happy Test :: Gets item and returns it ', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"

    const expectedPartitionKey = "userId"
    const expectedSortKey = "id"

    const expectedExpressionAttributes = {
        "#nm": "name",
        "#active": "active"
    }

    const mockItem = { id: '123TESTEXPECTEDID', userId: "456EXPECTEDUSERID" };

    var expectedParams = {
        TableName: testTableName,
        Key: {
            id: expectedId,
            userId: expectedUserId
        }
    }

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params: GetItemInput, callback: Function) => {
        t.deepLooseEqual(params, expectedParams);
        callback(null, { Item: mockItem });
    })


    let repository = new FakeBaseDynamoRepository(testTableName, expectedPartitionKey, expectedSortKey, expectedExpressionAttributes)

    // Act
    const result = await repository.getByPartitionAndSortKeys(expectedUserId, expectedId);

    // Assert

    t.deepLooseEqual(result, mockItem);
    t.end();
    AWSMock.restore('DynamoDB.DocumentClient');
    sinon.restore();
})

test('BaseDynamoRepository.update :: Overall Happy Test :: updates item ', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"
    const expectedName = "EXPECTEDNAME9342"
    const expectedActive = true

    const expectedPartitionKey = "userId"
    const expectedSortKey = "id"

    const expectedExpressionAttributes = {
        "#nm": "name",
        "#active": "active"
    }

    const input = { id: expectedId, userId: expectedUserId, name: expectedName, active: expectedActive };

    var expectedUpdateParams = {
        TableName: testTableName,
        Item: input
    };

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params: PutItemInput, callback: Function) => {
        t.deepLooseEqual(params, expectedUpdateParams);
        callback(null, {});
    })

    let repository = new FakeBaseDynamoRepository(testTableName, expectedPartitionKey, expectedSortKey, expectedExpressionAttributes)

    // Act
    await repository.update(input);

    // Assert

    t.end();
    AWSMock.restore('DynamoDB.DocumentClient');
    sinon.restore();
})

test('BaseDynamoRepository.delete :: Overall Happy Test :: deletes item ', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"

    const expectedPartitionKey = "userId"
    const expectedSortKey = "id"

    const expectedExpressionAttributes = {
        "#nm": "name",
        "#active": "active"
    }

    var expectedParams = {
        TableName: testTableName,
        Key: {
            id: expectedId,
            userId: expectedUserId
        }
    }


    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'delete', (params: DeleteItemInput, callback: Function) => {
        t.deepLooseEqual(params, expectedParams);
        callback(null, {});
    })

    let repository = new FakeBaseDynamoRepository(testTableName, expectedPartitionKey, expectedSortKey, expectedExpressionAttributes)

    // Act
    await repository.deleteByPartitionAndSortKey(expectedUserId, expectedId);

    // Assert

    t.end();
    AWSMock.restore('DynamoDB.DocumentClient');
    sinon.restore();
})
