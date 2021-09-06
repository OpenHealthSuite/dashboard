const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require("sinon");
const _ = require("lodash")

test('trainingPlanHandlers.planCreate :: Overall Happy Test :: Creates new item for user', async function (t) {
    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"
    const expectedName = "NAMEINPUT"

    const mockItem = { id: expectedId, userId: expectedUserId, name: expectedName };

    var inputBody = {
        name: expectedName
    }

    const lambda = proxyquire('../../../src/handlers/trainingPlanHandlers.js', {
        '../repositories/trainingPlanRepository': {
            createTrainingPlan: sinon.stub().callsFake((userId, inputItem) => {
                t.isEqual(userId, expectedUserId)
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
        body: JSON.stringify(inputBody)
    }

    // Act
    const result = await lambda.planCreate(event);

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

test('trainingPlanHandlers.planDelete :: Overall Happy Test :: Valid Id and User deletes item', async function (t) {
    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"

    const mockItem = { id: expectedId, userId: expectedUserId };

    const lambda = proxyquire('../../../src/handlers/trainingPlanHandlers.js', {
        '../repositories/trainingPlanRepository': {
            getTrainingPlan: sinon.stub().callsFake((userId, itemId) => {
                t.isEqual(userId, expectedUserId)
                t.isEqual(itemId, expectedId)
                return mockItem
            }),
            deleteTrainingPlan: sinon.stub().callsFake((userId, itemId) => {
                t.isEqual(userId, expectedUserId)
                t.isEqual(itemId, expectedId)
            })
        }
    });

    const event = {
        httpMethod: 'DELETE',
        pathParameters: {
            id: expectedId
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
    const result = await lambda.planDelete(event);

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

test('trainingPlanHandlers.planGetAll :: Overall Happy Test :: Valid User gets items', async function (t) {
    const expectedUserId = "456EXPECTEDUSERID"

    const mockItems = [{ id: '123TESTEXPECTEDID', userId: expectedUserId }];

    const lambda = proxyquire('../../../src/handlers/trainingPlanHandlers.js', {
        '../repositories/trainingPlanRepository': {
            getTrainingPlansForUser: sinon.stub().callsFake((userId) => {
                t.isEqual(userId, expectedUserId)
                return mockItems
            })
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
    }

    // Act
    const result = await lambda.planGetAll(event);

    // Assert
    const expectedResult = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(mockItems)
    };

    t.deepLooseEqual(result, expectedResult);
    t.end();
})

test('trainingPlanHandlers.planGet :: Overall Happy Test :: Valid Id and User gets item', async function (t) {
    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"

    const mockItem = { id: '123TESTEXPECTEDID', userId: "456EXPECTEDUSERID" };

    const lambda = proxyquire('../../../src/handlers/trainingPlanHandlers.js', {
        '../repositories/trainingPlanRepository': {
            getTrainingPlan: sinon.stub().callsFake((userId, itemId) => {
                t.isEqual(userId, expectedUserId)
                t.isEqual(itemId, expectedId)
                return mockItem
            })
        }
    });

    const event = {
        httpMethod: 'GET',
        pathParameters: {
            id: expectedId
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
    const result = await lambda.planGet(event);

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

test('trainingPlanHandlers.planUpdate :: Overall Happy Test :: Valid Id and UserId updates item', async function (t) {
    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"
    const expectedName = "askdaskdmNAME"
    const expectedActive = false
    const inputBody = {
        name: expectedName,
        active: expectedActive
    }
    const expectedInputUpdate = {
        id: expectedId,
        userId: expectedUserId,
        name: expectedName,
        active: expectedActive
    }
    const mockItem = { id: expectedId, userId: expectedUserId };

    const lambda = proxyquire('../../../src/handlers/trainingPlanHandlers.js', {
        '../repositories/trainingPlanRepository': {
            getTrainingPlan: sinon.stub().callsFake((userId, itemId) => {
                t.isEqual(userId, expectedUserId)
                t.isEqual(itemId, expectedId)
                return mockItem
            }),
            updateTrainingPlan: sinon.stub().callsFake((inputUpdate) => {
                t.deepLooseEqual(inputUpdate, expectedInputUpdate)
                return inputUpdate
            })
        }
    });

    const event = {
        httpMethod: 'PUT',
        pathParameters: {
            id: expectedId
        },
        requestContext: {
            authorizer: {
                claims: {
                    sub: expectedUserId
                }
            }
        },
        body: JSON.stringify(inputBody)
    }

    // Act
    const result = await lambda.planUpdate(event);

    // Assert
    const expectedResult = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(expectedInputUpdate)
    };

    t.deepLooseEqual(result, expectedResult);
    t.end();
})
