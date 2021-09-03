const { accessControlHeaders } = require('../../helpers/requiredHeaders');
const dynamodb = require('aws-sdk/clients/dynamodb');
const { v4: uuidv4 } = require('uuid');
const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.TRAINING_PLAN_TABLE;

/**
 * A simple example includes a HTTP post method to create a new training plan
 */
exports.planCreate = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    
    const userId = event.requestContext.authorizer.claims.sub
    const body = JSON.parse(event.body)
    const name = body.name;

    const newItem = { 
        id : uuidv4(),
        userId: userId,
        name: name 
    }

    var params = {
        TableName : tableName,
        Item: newItem
    };

    await docClient.put(params).promise();

    const response = {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(newItem)
    };

    return response;
}
