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

    var expectedParams = {
        TableName : testTableName,
        Key: { 
          id: expectedId,
          userId: expectedUserId
        }
      }

    // Return the specified value whenever the spied get function is called 
    // getSpy.mockReturnValue({ 
    //                  promise: () => Promise.resolve({ Item: mockItem }) 
    //              }); 
    const lambda = proxyquire('../../../../src/handlers/trainingplan/plan-get.js', {
        'aws-sdk/clients/dynamodb': {
            DocumentClient: sinon.stub().callsFake(() => {
                return {
                    get: sinon.stub().callsFake((input) => {
                        return { 
                            promise: sinon.stub().resolves({ Item: mockItem })
                        }
                    })
                }
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
