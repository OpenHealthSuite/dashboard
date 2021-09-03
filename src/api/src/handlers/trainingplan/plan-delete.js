const { accessControlHeaders } = require('../../helpers/requiredHeaders');
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const tableName = process.env.TRAINING_PLAN_TABLE;

/**
 * Delete a training plan
 */
exports.planDelete = async (event) => {
    if (event.httpMethod !== 'DELETE') {
        throw new Error(`only accepts DELETE method, you tried: ${event.httpMethod} method.`);
    }

    const userId = event.requestContext.authorizer.claims.sub

    const id = event.pathParameters.id;

    var getParams = {
        TableName : tableName,
        Key: { 
          id: id,
          userId: userId
        }
    };

    const existing = await docClient.get(getParams).promise();

    if (!existing || !existing.Item || existing.Item.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${id}`);
    }

    await docClient.delete(getParams).promise();

    const response = {
        statusCode: 200,
        headers: accessControlHeaders
    };

    return response;
}
