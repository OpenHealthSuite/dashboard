const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require("sinon");
const _ = require("lodash")
 

test('plan-get.planGet :: Overall Happy Test :: Valid Id and User gets item', async function (t) {
    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"
    const expectedName = "askdaskdmNAME"
    const inputBody = {
        name: expectedName
      }
    const expectedInputUpdate = {
        id: expectedId,
        userId: expectedUserId,
        name: expectedName
    }
    const mockItem = { id: expectedId, userId: expectedUserId }; 

    const lambda = proxyquire('../../../../src/handlers/trainingplan/plan-update.js', {
        '../../repositories/trainingPlanRepository': {
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
            "Access-Control-Allow-Headers" : "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(expectedInputUpdate)
    }; 
    
    t.deepLooseEqual(result, expectedResult);
    t.end();
})
