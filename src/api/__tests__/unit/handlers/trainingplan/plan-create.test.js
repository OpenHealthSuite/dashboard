const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require("sinon");
 

test('plan-create.planCreate :: Overall Happy Test :: Creates new item for user', async function (t) {
    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"
    const expectedName = "NAMEINPUT"

    const mockItem = { id: expectedId, userId: expectedUserId, name: expectedName }; 

    var inputBody ={
        name: expectedName
    }

    const lambda = proxyquire('../../../../src/handlers/trainingplan/plan-create.js', {
        '../../repositories/trainingPlanRepository': {
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
            "Access-Control-Allow-Headers" : "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(mockItem) 
    }; 
    
    t.deepLooseEqual(result, expectedResult);
    t.end();
})
