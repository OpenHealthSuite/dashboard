const { accessControlHeaders } = require('../../helpers/requiredHeaders');
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const tableName = process.env.TRAINING_PLAN_TABLE;

/**
 * Update a training plan
 */
exports.planUpdate = async (event) => {
    if (event.httpMethod !== 'PUT') {
        throw new Error(`only accepts PUT method, you tried: ${event.httpMethod} method.`);
    }
    const userId = event.requestContext.authorizer.claims.sub

    const body = JSON.parse(event.body)
    const id = event.pathParameters.id;
    const name = body.name;

    var getParams = {
        TableName : tableName,
        Key: { 
            id: id,
            userId: userId
        }
    };

    const existing = await docClient.get(getParams).promise()

    if (!existing || !existing.Item || existing.Item.userId !== userId) {
        throw new Error(`No item with ${id} found`);
    }

    const itemUpdate = { 
        id : id,
        userId: userId,
        name: name 
    }
    
    var updateParams = {
        TableName: tableName,
        Key: { 
          id: id,
          userId: userId
        },
        UpdateExpression: "set #nm = :name",
        ExpressionAttributeNames: {
            "#nm": "name",
        },
        ExpressionAttributeValues:{
            ":name":name,
        },
        ReturnValues:"UPDATED_NEW"
    };

    await docClient.put(updateParams).promise();

    const response = {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(itemUpdate)
    };
    return response;
}
