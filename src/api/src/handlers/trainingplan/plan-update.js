// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.TRAINING_PLAN_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.planUpdate = async (event) => {
    if (event.httpMethod !== 'PUT') {
        throw new Error(`only accepts PUT method, you tried: ${event.httpMethod} method.`);
    }

    // All log statements are written to CloudWatch
    console.info('received:', event);

    // Get id and name from the body of the request
    const body = JSON.parse(event.body)
    const id = event.pathParameters.id;
    const name = body.name;

    var getParams = {
        TableName : tableName,
        Key: {id: id}
    };

    const existing = await docClient.get(getParams).promise()

    if (!!existing.Item || existing.Item.userId !== context.identity.cognitoIdentityId) {
        throw new Error(`No item with ${id} found`);
    }

    const itemUpdate = { 
        id : id,
        userId: context.identity.cognitoIdentityId,
        name: name 
    }

    // Creates a new item, or replaces an old item with a new item
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
    var updateParams = {
        TableName : tableName,
        Item: itemUpdate
    };

    const result = await docClient.put(updateParams).promise();

    const response = {
        statusCode: 200,
        body: JSON.stringify(itemUpdate)
    };

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}
