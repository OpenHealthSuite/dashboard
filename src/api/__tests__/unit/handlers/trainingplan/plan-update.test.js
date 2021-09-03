// Import all functions from get-by-id.js 

// Import dynamodb from aws-sdk 
const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require("sinon");
const _ = require("lodash")
 

test('plan-get.planGet :: Overall Happy Test :: Valid Id and User gets item', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"
    const expectedName = "EXPECTEDNAME9342"

    const mockItem = { id: '123TESTEXPECTEDID', userId: "456EXPECTEDUSERID", originalName: "ORIGINALNAME" }; 

    process.env.TRAINING_PLAN_TABLE = testTableName;

    let expectedUpdate = false;

    var expectedGetParams = {
        TableName : testTableName,
        Key: { 
          id: expectedId,
          userId: expectedUserId
        }
      }

    var expectedUpdateParams = {
        TableName: testTableName,
        Key: { 
          id: expectedId,
          userId: expectedUserId
        },
        UpdateExpression: "set #nm = :name",
        ExpressionAttributeNames: {
            "#nm": "name",
        },
        ExpressionAttributeValues:{
            ":name":expectedName,
        },
        ReturnValues:"UPDATED_NEW"
    };

    const lambda = proxyquire('../../../../src/handlers/trainingplan/plan-update.js', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    get: sinon.stub().callsFake((input) => {
                        if(_.isEqual(input, expectedGetParams)){
                            return { 
                                promise: sinon.stub().resolves({ Item: mockItem })
                            }
                        }
                    }),
                    put: sinon.stub().callsFake((input) => {
                        if(_.isEqual(input, expectedUpdateParams)){
                            expectedUpdate = true;
                            return { 
                                promise: sinon.stub().resolves()
                            }
                        }
                    })
                }
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
        body: JSON.stringify({ 
            id: expectedId,
            userId: expectedUserId,
            name: expectedName
          })
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
        body: JSON.stringify({ 
            id: expectedId,
            userId: expectedUserId,
            name: expectedName
          })
    }; 
    
    t.deepLooseEqual(result, expectedResult);
    t.true(expectedUpdate);
    t.end();
})
