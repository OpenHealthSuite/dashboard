// Import all functions from get-by-id.js 

// Import dynamodb from aws-sdk 
const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require("sinon");
const _ = require("lodash")
 

test('plan-get-all.planGetAll :: Overall Happy Test :: Valid User gets items', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedUserId = "456EXPECTEDUSERID"

    const mockItems = [{ id: '123TESTEXPECTEDID', userId: expectedUserId }]; 

    process.env.TRAINING_PLAN_TABLE = testTableName;

    var expectedParams = {
        TableName : testTableName,
        ProjectionExpression:"userId, id, #nm",
        FilterExpression: "userId = :contextUserId",
        ExpressionAttributeNames: {
            "#nm": "name",
        },
        ExpressionAttributeValues: {
            ":contextUserId": expectedUserId
        }
      }

    const lambda = proxyquire('../../../../src/handlers/trainingplan/plan-get-all.js', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    scan: sinon.stub().callsFake((input) => {
                        if(_.isEqual(input, expectedParams)){
                            return { 
                                promise: sinon.stub().resolves({ Items:  mockItems })
                            }
                        }
                    })
                }
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
