// Import all functions from get-by-id.js 

// Import dynamodb from aws-sdk 
const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require("sinon");
const _ = require("lodash")
 

test('plan-get-all.planGetAll :: Overall Happy Test :: Valid User gets items', async function (t) {
    const expectedUserId = "456EXPECTEDUSERID"

    const mockItems = [{ id: '123TESTEXPECTEDID', userId: expectedUserId }]; 

    const lambda = proxyquire('../../../../src/handlers/trainingplan/plan-get-all.js', {
        '../../repositories/trainingPlanRepository': {
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
            "Access-Control-Allow-Headers" : "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(mockItems) 
    }; 
    
    t.deepLooseEqual(result, expectedResult);
    t.end();
})
