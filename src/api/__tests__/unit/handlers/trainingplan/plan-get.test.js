const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require("sinon");
 

test('plan-get.planGet :: Overall Happy Test :: Valid Id and User gets item', async function (t) {
    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"

    const mockItem = { id: '123TESTEXPECTEDID', userId: "456EXPECTEDUSERID" }; 

    const lambda = proxyquire('../../../../src/handlers/trainingplan/plan-get.js', {
        '../../repositories/trainingPlanRepository': {
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
            "Access-Control-Allow-Headers" : "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(mockItem) 
    }; 
    
    t.deepLooseEqual(result, expectedResult);
    t.end();
})
