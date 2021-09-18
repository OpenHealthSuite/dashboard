import * as test from "tape";
import * as proxyquire from 'proxyquire';
import * as sinon from "sinon";
import * as _ from "lodash";

import { TrainingPlanRepository, ITrainingPlan } from "../../../src/repositories/trainingPlanRepository" 

test('trainingPlanHandlers.planCreate :: Overall Happy Test :: Creates new item for user', async function (t) {
    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"
    const expectedName = "NAMEINPUT"
    const expectedActive = true

    const mockItem = { id: expectedId, userId: expectedUserId, name: expectedName, active: expectedActive };

    var inputBody = {
        name: expectedName
    }

    sinon.stub(TrainingPlanRepository.prototype, "createTrainingPlan").callsFake((userId: string, inputItem: ITrainingPlan) => {
        t.isEqual(userId, expectedUserId)
        t.deepLooseEqual(inputItem, inputBody)
        return new Promise((resolve) => resolve(mockItem))
    })

    const lambda = proxyquire('../../../src/handlers/trainingPlanHandlers.ts', {
        '../repositories/trainingPlanRepository': {}
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
    sinon.restore();
})

test('trainingPlanHandlers.planDelete :: Overall Happy Test :: Valid Id and User deletes item', async function (t) {
    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"

    const mockItem = { id: expectedId, userId: expectedUserId, active: false, name: "" };

    sinon.stub(TrainingPlanRepository.prototype, "getTrainingPlan").callsFake((userId: string, itemId: string) => {
        t.isEqual(userId, expectedUserId)
        t.isEqual(itemId, expectedId)
        return new Promise((resolve) => resolve(mockItem))
    })

    sinon.stub(TrainingPlanRepository.prototype, "deleteTrainingPlan").callsFake((userId: string, itemId: string) => {
        t.isEqual(userId, expectedUserId)
        t.isEqual(itemId, expectedId)
        return new Promise((resolve) => resolve())
    })

    const lambda = proxyquire('../../../src/handlers/trainingPlanHandlers.ts', {
        '../repositories/trainingPlanRepository': { }
    });

    const event = {
        httpMethod: 'DELETE',
        pathParameters: {
            trainingPlanId: expectedId
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
    sinon.restore();
})

test('trainingPlanHandlers.planGetAll :: Overall Happy Test :: Valid User gets items', async function (t) {
    const expectedUserId = "456EXPECTEDUSERID"

    const mockItems = [{ id: '123TESTEXPECTEDID', userId: expectedUserId , name: "", active: false}];

    sinon.stub(TrainingPlanRepository.prototype, "getTrainingPlansForUser").callsFake((userId: string) => {
        t.isEqual(userId, expectedUserId)
        return new Promise((resolve) => resolve(mockItems))
    })

    const lambda = proxyquire('../../../src/handlers/trainingPlanHandlers.ts', {
        '../repositories/trainingPlanRepository': {}
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
    sinon.restore();
})

test('trainingPlanHandlers.planGet :: Overall Happy Test :: Valid Id and User gets item', async function (t) {
    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"

    const mockItem = { id: expectedId, userId: expectedUserId, active: false, name: "" };

    sinon.stub(TrainingPlanRepository.prototype, "getTrainingPlan").callsFake((userId: string, itemId: string) => {
        t.isEqual(userId, expectedUserId)
        t.isEqual(itemId, expectedId)
        return new Promise((resolve) => resolve(mockItem))
    })

    const lambda = proxyquire('../../../src/handlers/trainingPlanHandlers.ts', {
        '../repositories/trainingPlanRepository': { }
    });

    const event = {
        httpMethod: 'GET',
        pathParameters: {
            trainingPlanId: expectedId
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
    sinon.restore();
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
    const mockItem = { id: expectedId, userId: expectedUserId, active: false, name: "" };

    sinon.stub(TrainingPlanRepository.prototype, "getTrainingPlan").callsFake((userId: string, itemId: string) => {
        t.isEqual(userId, expectedUserId)
        t.isEqual(itemId, expectedId)
        return new Promise((resolve) => resolve(mockItem))
    })

    sinon.stub(TrainingPlanRepository.prototype, "updateTrainingPlan").callsFake((inputUpdate: ITrainingPlan) => {
        t.deepLooseEqual(inputUpdate, expectedInputUpdate)
        return new Promise((resolve) => resolve())
    })

    const lambda = proxyquire('../../../src/handlers/trainingPlanHandlers.ts', {
        '../repositories/trainingPlanRepository': { }
    });

    const event = {
        httpMethod: 'PUT',
        pathParameters: {
            trainingPlanId: expectedId
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
    sinon.restore();
})
