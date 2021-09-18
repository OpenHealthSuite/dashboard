import * as test from "tape";
const proxyquire = require('proxyquire');
const sinon = require("sinon");
const _ = require("lodash")

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
        TableName : testTableName,
        Item: newItem
    }
    var inputParams;

    const { BaseDynamoRepository } = proxyquire('../../../src/repositories/baseDynamoRepository.ts', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    put: sinon.stub().callsFake((input: any) => {
                        inputParams = input;
                        return { 
                            promise: sinon.stub().resolves()
                        }
                    })
                }
            })
        }
    }); 

    let repository = new BaseDynamoRepository(testTableName, expectedPartitionKey, expectedExpressionAttributes, expectedSortKey)

    // Act
    const result = await repository.create(newItem); 

    // Assert
    
    t.deepLooseEqual(result, newItem);
    t.deepLooseEqual(inputParams, expectedParams);
    t.end();
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
        TableName : testTableName,
        ProjectionExpression:"userId, id, #nm, #active",
        FilterExpression: "userId = :requestedPartitionKey",
        ExpressionAttributeNames: expectedExpressionAttributes,
        ExpressionAttributeValues: {
            ":requestedPartitionKey": expectedUserId
        }
      }
      const { BaseDynamoRepository } = proxyquire('../../../src/repositories/baseDynamoRepository.ts', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    scan: sinon.stub().callsFake((input: any) => {
                        t.deepLooseEqual(input, expectedParams);
                        return { 
                            promise: sinon.stub().resolves({ Items:  mockItems })
                        }
                    })
                }
            })
        }
    }); 

    let repository = new BaseDynamoRepository(testTableName, expectedPartitionKey, expectedExpressionAttributes, expectedSortKey)

    // Act
    const result = await repository.getAllByPartitionKey(expectedUserId); 

    // Assert
    
    t.deepLooseEqual(result, mockItems);
    t.end();
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
        TableName : testTableName,
        Key: { 
          id: expectedId,
          userId: expectedUserId
        }
      }
      const { BaseDynamoRepository } = proxyquire('../../../src/repositories/baseDynamoRepository.ts', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    get: sinon.stub().callsFake((input: any) => {
                        t.deepLooseEqual(input, expectedParams);
                        return { 
                            promise: sinon.stub().resolves({ Item: mockItem })
                        }
                    })
                }
            })
        }
    }); 

    let repository = new BaseDynamoRepository(testTableName, expectedPartitionKey, expectedExpressionAttributes, expectedSortKey)

    // Act
    const result = await repository.getByPartitionAndSortKeys(expectedUserId, expectedId); 

    // Assert
    
    t.deepLooseEqual(result, mockItem);
    t.end();
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

    var actualUpdateParams;

    const { BaseDynamoRepository } = proxyquire('../../../src/repositories/baseDynamoRepository.ts', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    put: sinon.stub().callsFake((input: any) => {
                        actualUpdateParams = input;
                        return { 
                            promise: sinon.stub().resolves()
                        }
                    })
                }
            })
        }
    }); 


    let repository = new BaseDynamoRepository(testTableName, expectedPartitionKey, expectedExpressionAttributes, expectedSortKey)

    // Act
    await repository.update(input); 

    // Assert
    
    t.deepLooseEqual(actualUpdateParams, expectedUpdateParams);
    t.end();
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
        TableName : testTableName,
        Key: { 
          id: expectedId,
          userId: expectedUserId
        }
      }
    var actualParams;
    const { BaseDynamoRepository } = proxyquire('../../../src/repositories/baseDynamoRepository.ts', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    delete: sinon.stub().callsFake((input: any) => {
                        actualParams = input;
                        return { 
                            promise: sinon.stub().resolves()
                        }
                        
                    })
                }
            })
        }
    }); 

    let repository = new BaseDynamoRepository(testTableName, expectedPartitionKey, expectedExpressionAttributes, expectedSortKey)

    // Act
    await repository.deleteByPartitionAndSortKey(expectedUserId, expectedId); 

    // Assert
    
    t.deepLooseEqual(actualParams, expectedParams);
    t.end();
})
