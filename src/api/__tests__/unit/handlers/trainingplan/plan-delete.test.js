// Import all functions from get-by-id.js 

// Import dynamodb from aws-sdk 
const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require("sinon");
 

test('plan-get.planGet :: Overall Happy Test :: Valid Id and User gets item', async function (t) {
    const testTableName = "TESTTABLE"

    const expectedId = "123TESTEXPECTEDID"
    const expectedUserId = "456EXPECTEDUSERID"

    const mockItem = { id: '123TESTEXPECTEDID', userId: "456EXPECTEDUSERID" }; 

    process.env.TRAINING_PLAN_TABLE = testTableName;

    let expectedDeletion = false;

    var expectedParams = {
        TableName : testTableName,
        Key: { 
          id: expectedId,
          userId: expectedUserId
        }
      }

    const lambda = proxyquire('../../../../src/handlers/trainingplan/plan-delete.js', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    get: sinon.stub().callsFake((input) => {
                        if(input.TableName == expectedParams.TableName &&
                            input.Key.id == expectedParams.Key.id  &&
                            input.Key.userId == expectedParams.Key.userId){
                            return { 
                                promise: sinon.stub().resolves({ Item: mockItem })
                            }
                        }
                    }),
                    delete: sinon.stub().callsFake((input) => {
                        if(input.TableName == expectedParams.TableName &&
                            input.Key.id == expectedParams.Key.id  &&
                            input.Key.userId == expectedParams.Key.userId){
                            expectedDeletion = true;
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
    t.true(expectedDeletion);
    t.end();
})
