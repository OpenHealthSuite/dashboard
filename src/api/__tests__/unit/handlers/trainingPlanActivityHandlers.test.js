const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require("sinon");
const _ = require("lodash")

test('trainingPlanActivityHandlers.activityCreate :: Overall Happy Test :: Creates new item for user', async function (t) {

    const expectedUserId = "456EXPECTEDUSERID"
    const expectedName = "NAMEINPUT"
    const expectedTrainingPlanId = "0192381293TrainingPlanId"

    const mockItem = { id: expectedTrainingPlanId, userId: expectedUserId, name: expectedName };

    var inputBody = {
        name: expectedName
    }

    const lambda = proxyquire('../../../src/handlers/trainingPlanActivityHandlers.js', {
        '../repositories/trainingPlanRepository': {
            getTrainingPlan: sinon.stub().callsFake((userId, trainingPlanId) => {
                t.isEqual(userId, expectedUserId)
                t.isEqual(trainingPlanId, expectedTrainingPlanId)
                return mockItem
            })
        },
        '../repositories/trainingPlanActivityRepository': {
            createTrainingPlanActivity: sinon.stub().callsFake((trainingPlanId, inputItem) => {
                t.isEqual(trainingPlanId, expectedTrainingPlanId)
                t.deepLooseEqual(inputItem, inputBody)
                return mockItem
            })
        }
    });

    const event = {
        httpMethod: 'POST',
        requestContext: {
            authorizer: {
                claims: {
                    sub: expectedUserId
                }
            }
        },
        pathParameters: {
            trainingPlanId: expectedTrainingPlanId
        },
        body: JSON.stringify(inputBody)
    }

    // Act
    const result = await lambda.activityCreate(event);

    // Assert
    const expectedResult = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(mockItem)
    };

    t.deepLooseEqual(result, expectedResult);
    t.end();
})

test('trainingPlanActivityHandlers.activityDelete :: Overall Happy Test :: Valid Id and User deletes item', async function (t) {
    const expectedTrainingPlanId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"
    const expectedActivityId = "expectskdfmactivityid"

    const mockItem = { id: expectedTrainingPlanId, userId: expectedUserId };
    const mockActivityItem = { id: expectedActivityId, trainingPlanId: expectedTrainingPlanId };

    const lambda = proxyquire('../../../src/handlers/trainingPlanActivityHandlers.js', {
        '../repositories/trainingPlanRepository': {
            getTrainingPlan: sinon.stub().callsFake((userId, itemId) => {
                t.isEqual(userId, expectedUserId)
                t.isEqual(itemId, expectedTrainingPlanId)
                return mockItem
            }),
        },
        '../repositories/trainingPlanActivityRepository': {
            getTrainingPlanActivity: sinon.stub().callsFake((trainingPlanId, activityId) => {
                t.isEqual(trainingPlanId, expectedTrainingPlanId)
                t.isEqual(activityId, expectedActivityId)
                return mockActivityItem
            }),
            deleteTrainingPlanActivity: sinon.stub().callsFake((trainingPlanId, activityId) => {
                t.isEqual(trainingPlanId, expectedTrainingPlanId)
                t.isEqual(activityId, expectedActivityId)
            })
        }
    });

    const event = {
        httpMethod: 'DELETE',
        pathParameters: {
            trainingPlanId: expectedTrainingPlanId,
            activityId: expectedActivityId
        },
        requestContext: {
            authorizer: {
                claims: {
                    sub: expectedUserId
                }
            }
        }
    }

    // Act
    const result = await lambda.activityDelete(event);

    // Assert
    const expectedResult = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*"
        }
    };

    t.deepLooseEqual(result, expectedResult);
    t.end();
})

test('trainingPlanActivityHandlers.activityGetAll :: Overall Happy Test :: Valid User gets items', async function (t) {
    const expectedTrainingPlanId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"

    const mockItem = { id: expectedTrainingPlanId, userId: expectedUserId };
    const mockActivityItems = [{ id: '123TESTEXPECTEDID', trainingPlanId: expectedTrainingPlanId }];

    const lambda = proxyquire('../../../src/handlers/trainingPlanActivityHandlers.js', {
        '../repositories/trainingPlanRepository': {
            getTrainingPlan: sinon.stub().callsFake((userId, itemId) => {
                t.isEqual(userId, expectedUserId)
                t.isEqual(itemId, expectedTrainingPlanId)
                return mockItem
            }),
        },
        '../repositories/trainingPlanActivityRepository': {
            getTrainingPlanActivitiesForTrainingPlan: sinon.stub().callsFake((trainingPlanId) => {
                t.isEqual(trainingPlanId, expectedTrainingPlanId)
                return mockActivityItems
            }),
        }
    });

    const event = {
        httpMethod: 'GET',
        requestContext: {
            authorizer: {
                claims: {
                    sub: expectedUserId
                }
            }
        }
        ,pathParameters: {
            trainingPlanId: expectedTrainingPlanId
        },
    }

    // Act
    const result = await lambda.activityGetAll(event);

    // Assert
    const expectedResult = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(mockActivityItems)
    };

    t.deepLooseEqual(result, expectedResult);
    t.end();
})

test('trainingPlanActivityHandlers.activityGet :: Overall Happy Test :: Valid Id and User gets item', async function (t) {
    const expectedTrainingPlanId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"
    const expectedActivityId = "expectskdfmactivityid"

    const mockItem = { id: expectedTrainingPlanId, userId: expectedUserId };
    const mockActivityItem = { id: expectedActivityId, trainingPlanId: expectedTrainingPlanId };

    const lambda = proxyquire('../../../src/handlers/trainingPlanActivityHandlers.js', {
        '../repositories/trainingPlanRepository': {
            getTrainingPlan: sinon.stub().callsFake((userId, itemId) => {
                t.isEqual(userId, expectedUserId)
                t.isEqual(itemId, expectedTrainingPlanId)
                return mockItem
            }),
        },
        '../repositories/trainingPlanActivityRepository': {
            getTrainingPlanActivity: sinon.stub().callsFake((trainingPlanId, activityId) => {
                t.isEqual(trainingPlanId, expectedTrainingPlanId)
                t.isEqual(activityId, expectedActivityId)
                return mockActivityItem
            })
        }
    });

    const event = {
        httpMethod: 'GET',
        pathParameters: {
            trainingPlanId: expectedTrainingPlanId,
            activityId: expectedActivityId
        },
        requestContext: {
            authorizer: {
                claims: {
                    sub: expectedUserId
                }
            }
        }
    }

    // Act
    const result = await lambda.activityGet(event);

    // Assert
    const expectedResult = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(mockActivityItem)
    };

    t.deepLooseEqual(result, expectedResult);
    t.end();
})

test('trainingPlanActivityHandlers.activityUpdate :: Overall Happy Test :: Valid Id and UserId updates item', async function (t) {
    const expectedTrainingPlanId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"
    const expectedActivityId = "expectskdfmactivityid"

    const expectedName = "ExpectedNAme"
    const expectedActivityTime = new Date(2015, 12, 24)
    const expectedSegments = [{id:"seg"}]
    const expectedComplete = false

    const mockItem = { id: expectedTrainingPlanId, userId: expectedUserId };
    const mockActivityItem = { id: expectedActivityId, trainingPlanId: expectedTrainingPlanId };

    const expectedItemUpdate = JSON.parse(JSON.stringify({
        id: expectedActivityId,
        trainingPlanId: expectedTrainingPlanId,
        name: expectedName,
        activityTime: expectedActivityTime,
        segments: expectedSegments,
        complete: expectedComplete
    }))

    const itemUpdateBody = JSON.parse(JSON.stringify({
        name: expectedName,
        activityTime: expectedActivityTime,
        segments: expectedSegments,
        complete: expectedComplete
    }))


    const lambda = proxyquire('../../../src/handlers/trainingPlanActivityHandlers.js', {
        '../repositories/trainingPlanRepository': {
            getTrainingPlan: sinon.stub().callsFake((userId, itemId) => {
                t.isEqual(userId, expectedUserId)
                t.isEqual(itemId, expectedTrainingPlanId)
                return mockItem
            }),
        },
        '../repositories/trainingPlanActivityRepository': {
            getTrainingPlanActivity: sinon.stub().callsFake((trainingPlanId, activityId) => {
                t.isEqual(trainingPlanId, expectedTrainingPlanId)
                t.isEqual(activityId, expectedActivityId)
                return mockActivityItem
            }),
            updateTrainingPlanActivity: sinon.stub().callsFake((itemUpdate) => {
                t.deepLooseEqual(itemUpdate, expectedItemUpdate)
                return mockActivityItem
            }),
        }
    });

    const event = {
        httpMethod: 'PUT',
        pathParameters: {
            trainingPlanId: expectedTrainingPlanId,
            activityId: expectedActivityId
        },
        requestContext: {
            authorizer: {
                claims: {
                    sub: expectedUserId
                }
            }
        },
        body: JSON.stringify(itemUpdateBody)
    }

    // Act
    const result = await lambda.activityUpdate(event);

    // Assert
    const expectedResult = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(expectedItemUpdate)
    };

    t.deepLooseEqual(result, expectedResult);
    t.end();
})
