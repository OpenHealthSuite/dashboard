import * as test from "tape";
import * as sinon from "sinon";
import * as _ from "lodash";

import * as lambda from "../../../src/handlers/trainingPlanActivityHandlers";

import { TrainingPlanRepository, ITrainingPlan } from "../../../src/repositories/trainingPlanRepository"
import { TrainingPlanActivityRepository, ITrainingPlanActivity } from "../../../src/repositories/trainingPlanActivityRepository"

const expectedUserId = "456EXPECTEDUSERID"
const expectedName = "NAMEINPUT"
const expectedTrainingPlanId = "123TESTEXPECTEDID"
const expectedActivityId = "expectskdfmactivityid"

const expectedActivityTime = new Date(2015, 12, 24)
const expectedComplete = false

const mockItem: ITrainingPlan = { id: expectedTrainingPlanId, userId: expectedUserId, name: expectedName, active: true };
const mockActivityItem: ITrainingPlanActivity = {
    id: expectedActivityId,
    trainingPlanId: expectedTrainingPlanId,
    name: "test",
    activityTime: expectedActivityTime,
    segments: [],
    complete: expectedComplete
};
const mockActivityItems: ITrainingPlanActivity[] = [mockActivityItem];

var inputBody = {
    name: expectedName
}

test('trainingPlanActivityHandlers.activityCreate :: Overall Happy Test :: Creates new item for user', async function (t) {

    sinon.stub(TrainingPlanRepository.prototype, "getTrainingPlan").callsFake((userId: string, itemId: string) => {
        t.isEqual(userId, expectedUserId)
        t.isEqual(itemId, expectedTrainingPlanId)
        return new Promise((resolve) => resolve(mockItem))
    })

    sinon.stub(TrainingPlanActivityRepository.prototype, "createTrainingPlanActivity").callsFake((trainingPlanId: string, inputItem: ITrainingPlanActivity) => {
        t.isEqual(trainingPlanId, expectedTrainingPlanId)
        t.deepLooseEqual(inputItem, inputBody)
        return new Promise((resolve) => resolve(mockActivityItem))
    })

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
        body: JSON.stringify(mockActivityItem)
    };

    t.deepLooseEqual(result, expectedResult);
    t.end();
    sinon.restore();
})

test('trainingPlanActivityHandlers.activityDelete :: Overall Happy Test :: Valid Id and User deletes item', async function (t) {

    sinon.stub(TrainingPlanRepository.prototype, "getTrainingPlan").callsFake((userId: string, itemId: string) => {
        t.isEqual(userId, expectedUserId)
        t.isEqual(itemId, expectedTrainingPlanId)
        return new Promise((resolve) => resolve(mockItem))
    })

    sinon.stub(TrainingPlanActivityRepository.prototype, "getTrainingPlanActivity").callsFake((trainingPlanId: string, activityId: string) => {
        t.isEqual(trainingPlanId, expectedTrainingPlanId)
        t.isEqual(activityId, expectedActivityId)
        return new Promise((resolve) => resolve(mockActivityItem))
    })

    sinon.stub(TrainingPlanActivityRepository.prototype, "deleteTrainingPlanActivity").callsFake((trainingPlanId: string, activityId: string) => {
        t.isEqual(trainingPlanId, expectedTrainingPlanId)
        t.isEqual(activityId, expectedActivityId)
        return new Promise((resolve) => resolve())
    })

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
    sinon.restore();
})

test('trainingPlanActivityHandlers.activityGetAll :: Overall Happy Test :: Valid User gets items', async function (t) {

    sinon.stub(TrainingPlanRepository.prototype, "getTrainingPlan").callsFake((userId: string, itemId: string) => {
        t.isEqual(userId, expectedUserId)
        t.isEqual(itemId, expectedTrainingPlanId)
        return new Promise((resolve) => resolve(mockItem))
    })

    sinon.stub(TrainingPlanActivityRepository.prototype, "getTrainingPlanActivitiesForTrainingPlan").callsFake((trainingPlanId: string) => {
        t.isEqual(trainingPlanId, expectedTrainingPlanId)
        return new Promise((resolve) => resolve(mockActivityItems))
    })

    const event = {
        httpMethod: 'GET',
        requestContext: {
            authorizer: {
                claims: {
                    sub: expectedUserId
                }
            }
        }
        , pathParameters: {
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
    sinon.restore();
})

test('trainingPlanActivityHandlers.activityGet :: Overall Happy Test :: Valid Id and User gets item', async function (t) {

    sinon.stub(TrainingPlanRepository.prototype, "getTrainingPlan").callsFake((userId: string, itemId: string) => {
        t.isEqual(userId, expectedUserId)
        t.isEqual(itemId, expectedTrainingPlanId)
        return new Promise((resolve) => resolve(mockItem))
    })

    sinon.stub(TrainingPlanActivityRepository.prototype, "getTrainingPlanActivity").callsFake((trainingPlanId: string, activityId: string) => {
        t.isEqual(trainingPlanId, expectedTrainingPlanId)
        t.isEqual(activityId, expectedActivityId)
        return new Promise((resolve) => resolve(mockActivityItem))
    })

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
    sinon.restore();
})

test('trainingPlanActivityHandlers.activityUpdate :: Overall Happy Test :: Valid Id and UserId updates item', async function (t) {


    const expectedItemUpdate = JSON.parse(JSON.stringify({
        id: expectedActivityId,
        trainingPlanId: expectedTrainingPlanId,
        name: expectedName,
        activityTime: expectedActivityTime,
        segments: [],
        complete: expectedComplete
    }))

    const itemUpdateBody = JSON.parse(JSON.stringify({
        name: expectedName,
        activityTime: expectedActivityTime,
        segments: [],
        complete: expectedComplete
    }))

    sinon.stub(TrainingPlanRepository.prototype, "getTrainingPlan").callsFake((userId: string, itemId: string) => {
        t.isEqual(userId, expectedUserId)
        t.isEqual(itemId, expectedTrainingPlanId)
        return new Promise((resolve) => resolve(mockItem))
    })

    sinon.stub(TrainingPlanActivityRepository.prototype, "getTrainingPlanActivity").callsFake((trainingPlanId: string, activityId: string) => {
        t.isEqual(trainingPlanId, expectedTrainingPlanId)
        t.isEqual(activityId, expectedActivityId)
        return new Promise((resolve) => resolve(mockActivityItem))
    })

    sinon.stub(TrainingPlanActivityRepository.prototype, "updateTrainingPlanActivity").callsFake((itemUpdate: ITrainingPlanActivity) => {
        t.deepLooseEqual(itemUpdate, expectedItemUpdate)
        return new Promise((resolve) => resolve())
    })

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
    sinon.restore();
})
