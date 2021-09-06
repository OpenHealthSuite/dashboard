const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require("sinon");
const _ = require("lodash")

test('trainingPlanActivityRepository.createTrainingPlanActivity :: Overall Happy Test :: Creates new training plan activity', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDPLANID"
    const expectedName = "NAMEINPUT"
    const expectedActivityTime = new Date(2020, 12, 25)
    const expectedSegments = [{something:"whatever"}]
    const expectedComplete = false

    const mockItem = { name: expectedName, activityTime: expectedActivityTime, segments: expectedSegments, complete: expectedComplete }; 

    process.env.TRAINING_PLAN_ACTIVITY_TABLE = testTableName;

    var newItem = { 
        id: expectedId,
        trainingPlanId: expectedUserId,
        name: expectedName,
        activityTime: expectedActivityTime,
        segments: expectedSegments,
        complete: expectedComplete
    }
    var expectedParams = {
        TableName : testTableName,
        Item: newItem
    }

    const { createTrainingPlanActivity } = proxyquire('../../../src/repositories/trainingPlanActivityRepository.js', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    put: sinon.stub().callsFake((input) => {
                        t.deepLooseEqual(input, expectedParams);
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
    const result = await createTrainingPlanActivity(expectedUserId, mockItem); 

    // Assert
    
    t.deepLooseEqual(result, newItem);
    t.end();
})

test('trainingPlanActivityRepository.getTrainingPlanActivitiesForTrainingPlan :: Overall Happy Test :: Get training plan activites', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedPlanId = "456EXPECTEDPLANID"

    const mockItems = [{ id: '123TESTEXPECTEDID', trainingPlanId: expectedPlanId }]; 

    process.env.TRAINING_PLAN_ACTIVITY_TABLE = testTableName;

    var expectedParams = {
        TableName : testTableName,
        ProjectionExpression:"trainingPlanId, id, #nm, #acttime, #segments, #complete",
        FilterExpression: "trainingPlanId = :contextPlanId",
        ExpressionAttributeNames: {
            "#nm": "name",
            "#acttime": "activityTime",
            "#segments": "segments",
            "#complete": "complete"
        },
        ExpressionAttributeValues: {
            ":contextPlanId": expectedPlanId
        }
      }
    const { getTrainingPlanActivitiesForTrainingPlan } = proxyquire('../../../src/repositories/trainingPlanActivityRepository.js', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    scan: sinon.stub().callsFake((input) => {
                        t.deepLooseEqual(input, expectedParams)
                        return { 
                            promise: sinon.stub().resolves({ Items:  mockItems })
                        }
                    })
                }
            })
        }
    }); 

    // Act
    const result = await getTrainingPlanActivitiesForTrainingPlan(expectedPlanId); 

    // Assert
    
    t.deepLooseEqual(result, mockItems);
    t.end();
})

test('trainingPlanActivityRepository.getTrainingPlanActivity :: Overall Happy Test :: Gets training plan activity ', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedId = "123TESTEXPECTEDID"
    const expectedTrainingPlanId = "456EXPECTEDPLANID"

    const mockItem = { id: expectedId, trainingPlanId: expectedTrainingPlanId }; 

    process.env.TRAINING_PLAN_ACTIVITY_TABLE = testTableName;

    var expectedParams = {
        TableName : testTableName,
        Key: { 
          trainingPlanId: expectedTrainingPlanId,
          id: expectedId
        }
      }
    const { getTrainingPlanActivity } = proxyquire('../../../src/repositories/trainingPlanActivityRepository.js', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    get: sinon.stub().callsFake((input) => {
                        t.deepLooseEqual(input, expectedParams)
                        return { 
                            promise: sinon.stub().resolves({ Item: mockItem })
                        }
                    })
                }
            })
        }
    }); 

    // Act
    const result = await getTrainingPlanActivity(expectedTrainingPlanId, expectedId); 

    // Assert
    
    t.deepLooseEqual(result, mockItem);
    t.end();
})

test('trainingPlanActivityRepository.updateTrainingPlanActivity :: Overall Happy Test :: updates training plan ', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedId = "123TESTEXPECTEDID"
    const expectedPlanId = "456EXPECTEDPLANID"
    const expectedName = "EXPECTEDNAME9342"
    const expectedActivityTime = new Date(2020, 12, 25)
    const expectedSegments = [{something:"whatever"}]
    const expectedComplete = false

    const input = { id: expectedId, trainingPlanId: expectedPlanId, name: expectedName, activityTime: expectedActivityTime, segments: expectedSegments, complete: expectedComplete }; 

    process.env.TRAINING_PLAN_ACTIVITY_TABLE = testTableName;

    var expectedUpdateParams = {
        TableName: testTableName,
        Key: { 
          id: expectedId,
          trainingPlanId: expectedPlanId
        },
        UpdateExpression: "set #nm = :name, #acttime = :activityTime, #segments = :segments, #complete = :complete",
        ExpressionAttributeNames: {
            "#nm": "name",
            "#acttime": "activityTime",
            "#segments": "segments",
            "#complete": "complete"
        },
        ExpressionAttributeValues:{
            ":name":expectedName,
            ":activityTime":expectedActivityTime,
            ":segments":expectedSegments,
            ":complete":expectedComplete
        },
        ReturnValues:"UPDATED_NEW"
    };

    const { updateTrainingPlanActivity } = proxyquire('../../../src/repositories/trainingPlanActivityRepository.js', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    put: sinon.stub().callsFake((input) => {
                        t.deepLooseEqual(input, expectedUpdateParams);
                        return { 
                            promise: sinon.stub().resolves()
                        }
                    })
                }
            })
        }
    }); 

    // Act
    await updateTrainingPlanActivity(input); 

    // Assert
    
    t.end();
})

test('trainingPlanActivityRepository.deleteTrainingPlanActivity :: Overall Happy Test :: Deletes training plan activity ', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedId = "123TESTEXPECTEDID"
    const expectedPlanId = "456EXPECTEDPLANID"

    process.env.TRAINING_PLAN_ACTIVITY_TABLE = testTableName;

    var expectedParams = {
        TableName : testTableName,
        Key: { 
          id: expectedId,
          trainingPlanId: expectedPlanId
        }
      }
    
    const { deleteTrainingPlanActivity } = proxyquire('../../../src/repositories/trainingPlanActivityRepository.js', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    delete: sinon.stub().callsFake((input) => {
                        t.deepLooseEqual(input, expectedParams);
                        return { 
                            promise: sinon.stub().resolves()
                        }
                        
                    })
                }
            })
        }
    }); 

    // Act
    await deleteTrainingPlanActivity(expectedPlanId, expectedId); 

    // Assert?
    
    t.end();
})
