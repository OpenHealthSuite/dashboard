const { accessControlHeaders } = require('../../helpers/requiredHeaders');
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();
const tableName = process.env.TRAINING_PLAN_TABLE;

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
exports.planGetAll = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
    }

    const userId = event.requestContext.authorizer.claims.sub
    
    var params = {
        TableName : tableName,
        ProjectionExpression:"userId, id, #nm",
        FilterExpression: "userId = :contextUserId",
        ExpressionAttributeNames: {
            "#nm": "name",
        },
        ExpressionAttributeValues: {
            ":contextUserId": userId
        }
    };
    const data = await docClient.scan(params).promise();
    const items = data.Items;

    const response = {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(items)
    };

    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}
