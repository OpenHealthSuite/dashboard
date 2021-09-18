import * as test from "tape";
const proxyquire = require('proxyquire');
const sinon = require("sinon");
const _ = require("lodash")

test('trainingPlanRepository.createTrainingPlan :: Overall Happy Test :: Creates new training plan', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"
    const expectedName = "NAMEINPUT"
    const expectedActive = true

    const mockItem = { name: expectedName, active: expectedActive }; 

    process.env.TRAINING_PLAN_TABLE = testTableName;

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

    const { TrainingPlanRepository } = proxyquire('../../../src/repositories/trainingPlanRepository.ts', {
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
        },
        'uuid': {
            v4: sinon.stub().callsFake(() => expectedId)
        }
    }); 

    let repository = new TrainingPlanRepository()

    // Act
    const result = await repository.createTrainingPlan(expectedUserId, mockItem); 

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
        ProjectionExpression:"userId, id, #nm, #active",
        FilterExpression: "userId = :contextUserId",
        ExpressionAttributeNames: {
            "#nm": "name",
            "#active": "active"
        },
        ExpressionAttributeValues: {
            ":contextUserId": expectedUserId
        }
      }
      const { TrainingPlanRepository } = proxyquire('../../../src/repositories/trainingPlanRepository.ts', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    scan: sinon.stub().callsFake((input: any) => {
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

    let repository = new TrainingPlanRepository()

    // Act
    const result = await repository.getTrainingPlansForUser(expectedUserId); 

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
      const { TrainingPlanRepository } = proxyquire('../../../src/repositories/trainingPlanRepository.ts', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    get: sinon.stub().callsFake((input: any) => {
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

    let repository = new TrainingPlanRepository()

    // Act
    const result = await repository.getTrainingPlan(expectedUserId, expectedId); 

    // Assert
    
    t.deepLooseEqual(result, mockItem);
    t.end();
})

test('trainingPlanRepository.updateTrainingPlan :: Overall Happy Test :: updates training plan ', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"
    const expectedName = "EXPECTEDNAME9342"
    const expectedActive = true


    const input = { id: expectedId, userId: expectedUserId, name: expectedName, active: expectedActive }; 

    process.env.TRAINING_PLAN_TABLE = testTableName;

    var expectedUpdateParams = {
        TableName: testTableName,
        Item: input
    };

    var actualUpdateParams;

    const { TrainingPlanRepository } = proxyquire('../../../src/repositories/trainingPlanRepository.ts', {
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

    let repository = new TrainingPlanRepository()

    // Act
    await repository.updateTrainingPlan(input); 

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
    const { TrainingPlanRepository } = proxyquire('../../../src/repositories/trainingPlanRepository.ts', {
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

    let repository = new TrainingPlanRepository()

    // Act
    await repository.deleteTrainingPlan(expectedUserId, expectedId); 

    // Assert
    
    t.deepLooseEqual(actualParams, expectedParams);
    t.end();
})
