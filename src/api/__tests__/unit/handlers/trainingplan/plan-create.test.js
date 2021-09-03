// Import all functions from get-by-id.js 

// Import dynamodb from aws-sdk 
const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require("sinon");
 

test('plan-create.planCreate :: Overall Happy Test :: Creates new item for user', async function (t) {
    

    const testTableName = "TESTTABLE"

    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"
    const expectedName = "NAMEINPUT"

    const mockItem = { id: '123TESTEXPECTEDID', userId: "456EXPECTEDUSERID", name: expectedName }; 

    process.env.TRAINING_PLAN_TABLE = testTableName;
    var newItem = { 
        id: expectedId,
        userId: expectedUserId,
        name: expectedName
    }
    var expectedParams = {
        TableName : testTableName,
        Item: newItem
    }
    var inputParams;

    const lambda = proxyquire('../../../../src/handlers/trainingplan/plan-create.js', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    put: sinon.stub().callsFake((input) => {
                        inputParams = input;
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

    const event = { 
        httpMethod: 'POST',
        requestContext: {
            authorizer: {
                claims: {
                    sub: expectedUserId
                }
            }
        },
        body: JSON.stringify({
            name: expectedName
        })
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
    t.deepLooseEqual(inputParams, expectedParams);
    t.end();
})
