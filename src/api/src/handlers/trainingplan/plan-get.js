// Get the DynamoDB table name from environment variables
const { accessControlHeaders } = require('../../helpers/requiredHeaders');
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const tableName = process.env.TRAINING_PLAN_TABLE;

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
exports.planGet = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }
  const userId = event.requestContext.authorizer.claims.sub

  // Get id from pathParameters from APIGateway because of `/{id}` at template.yml
  const id = event.pathParameters.id;
 
  var params = {
    TableName : tableName,
    Key: { 
      id: id,
      userId: userId
    }
  };
  const data = await docClient.get(params).promise();
  
  if (!data || !data.Item || data.Item.userId !== userId) {
    throw new Error(`No item with ${id} found`);
  }

  return {
    statusCode: 200,
    headers: accessControlHeaders,
    body: JSON.stringify(data.Item)
  };
}
