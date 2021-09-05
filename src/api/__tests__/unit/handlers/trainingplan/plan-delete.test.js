// Import all functions from get-by-id.js 

// Import dynamodb from aws-sdk 
const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require("sinon");
 

test('plan-delete.planDelete :: Overall Happy Test :: Valid Id and User deletes item', async function (t) {
    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"

    const mockItem = { id: expectedId, userId: expectedUserId }; 

    const lambda = proxyquire('../../../../src/handlers/trainingplan/plan-delete.js', {
        '../../repositories/trainingPlanRepository': {
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
            "Access-Control-Allow-Headers" : "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*"
        }
    }; 
    
    t.deepLooseEqual(result, expectedResult);
    t.end();
})
