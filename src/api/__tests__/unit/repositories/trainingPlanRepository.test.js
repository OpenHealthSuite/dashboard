const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require("sinon");
const _ = require("lodash")

test('trainingPlanRepository.createTrainingPlan :: Overall Happy Test :: Creates new training plan', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"
    const expectedName = "NAMEINPUT"

    const mockItem = { name: expectedName }; 

    process.env.TRAINING_PLAN_TABLE = testTableName;

    var newItem = { 
        id: expectedId,
        userId: expectedUserId,
        name: expectedName
    }
    var expectedParams = {
        TableName : testTableName,
        Item: newItem
    }
    var inputParams;

    const { createTrainingPlan } = proxyquire('../../../src/repositories/trainingPlanRepository.js', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    put: sinon.stub().callsFake((input) => {
                        inputParams = input;
                        return { 
                            promise: sinon.stub().resolves()
                        }
                    })
                }
            })
        },
        'uuid': {
            v4: sinon.stub().callsFake(() => expectedId)
        }
    }); 

    // Act
    const result = await createTrainingPlan(expectedUserId, mockItem); 

    // Assert
    
    t.deepLooseEqual(result, newItem);
    t.deepLooseEqual(inputParams, expectedParams);
    t.end();
})

test('trainingPlanRepository.getTrainingPlansForUser :: Overall Happy Test :: Get users training plan ', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedUserId = "456EXPECTEDUSERID"

    const mockItems = [{ id: '123TESTEXPECTEDID', userId: expectedUserId }]; 

    process.env.TRAINING_PLAN_TABLE = testTableName;

    var expectedParams = {
        TableName : testTableName,
        ProjectionExpression:"userId, id, #nm",
        FilterExpression: "userId = :contextUserId",
        ExpressionAttributeNames: {
            "#nm": "name",
        },
        ExpressionAttributeValues: {
            ":contextUserId": expectedUserId
        }
      }
    const { getTrainingPlansForUser } = proxyquire('../../../src/repositories/trainingPlanRepository.js', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    scan: sinon.stub().callsFake((input) => {
                        if(_.isEqual(input, expectedParams)){
                            return { 
                                promise: sinon.stub().resolves({ Items:  mockItems })
                            }
                        }
                    })
                }
            })
        }
    }); 

    // Act
    const result = await getTrainingPlansForUser(expectedUserId); 

    // Assert
    
    t.deepLooseEqual(result, mockItems);
    t.end();
})

test('trainingPlanRepository.getTrainingPlan :: Overall Happy Test :: Gets training plan ', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"

    const mockItem = { id: '123TESTEXPECTEDID', userId: "456EXPECTEDUSERID" }; 

    process.env.TRAINING_PLAN_TABLE = testTableName;

    var expectedParams = {
        TableName : testTableName,
        Key: { 
          id: expectedId,
          userId: expectedUserId
        }
      }
    const { getTrainingPlan } = proxyquire('../../../src/repositories/trainingPlanRepository.js', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    get: sinon.stub().callsFake((input) => {
                        if(_.isEqual(input, expectedParams)){
                            return { 
                                promise: sinon.stub().resolves({ Item: mockItem })
                            }
                        }
                    })
                }
            })
        }
    }); 

    // Act
    const result = await getTrainingPlan(expectedUserId, expectedId); 

    // Assert
    
    t.deepLooseEqual(result, mockItem);
    t.end();
})

test('trainingPlanRepository.updateTrainingPlan :: Overall Happy Test :: updates training plan ', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"
    const expectedName = "EXPECTEDNAME9342"

    const input = { id: expectedId, userId: expectedUserId, name: expectedName }; 

    process.env.TRAINING_PLAN_TABLE = testTableName;

    var expectedUpdateParams = {
        TableName: testTableName,
        Key: { 
          id: expectedId,
          userId: expectedUserId
        },
        UpdateExpression: "set #nm = :name",
        ExpressionAttributeNames: {
            "#nm": "name",
        },
        ExpressionAttributeValues:{
            ":name":expectedName,
        },
        ReturnValues:"UPDATED_NEW"
    };

    var actualUpdateParams;

    const { updateTrainingPlan } = proxyquire('../../../src/repositories/trainingPlanRepository.js', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    put: sinon.stub().callsFake((input) => {
                        actualUpdateParams = input;
                        return { 
                            promise: sinon.stub().resolves()
                        }
                    })
                }
            })
        }
    }); 

    // Act
    await updateTrainingPlan(input); 

    // Assert
    
    t.deepLooseEqual(actualUpdateParams, expectedUpdateParams);
    t.end();
})

test('trainingPlanRepository.deleteTrainingPlan :: Overall Happy Test :: Gets training plan ', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"

    process.env.TRAINING_PLAN_TABLE = testTableName;

    var expectedParams = {
        TableName : testTableName,
        Key: { 
          id: expectedId,
          userId: expectedUserId
        }
      }
    var actualParams;
    const { deleteTrainingPlan } = proxyquire('../../../src/repositories/trainingPlanRepository.js', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    delete: sinon.stub().callsFake((input) => {
                        actualParams = input;
                        return { 
                            promise: sinon.stub().resolves()
                        }
                        
                    })
                }
            })
        }
    }); 

    // Act
    await deleteTrainingPlan(expectedUserId, expectedId); 

    // Assert
    
    t.deepLooseEqual(actualParams, expectedParams);
    t.end();
})
