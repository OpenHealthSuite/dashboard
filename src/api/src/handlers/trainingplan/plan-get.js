const { accessControlHeaders } = require('../../helpers/requiredHeaders');
const { getTrainingPlan } = require('../../repositories/trainingPlanRepository');

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
 
  let plan = await getTrainingPlan(userId, id);
  
  if (!plan || plan.userId !== userId) {
    throw new Error(`No item with ${id} found`);
  }

  return {
    statusCode: 200,
    headers: accessControlHeaders,
    body: JSON.stringify(plan)
  };
}
