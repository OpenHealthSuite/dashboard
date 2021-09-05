const { accessControlHeaders } = require('../../helpers/requiredHeaders');
const { getTrainingPlansForUser } = require('../../repositories/trainingPlanRepository');

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
exports.planGetAll = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
    }

    const userId = event.requestContext.authorizer.claims.sub
    
    let items = await getTrainingPlansForUser(userId);

    const response = {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(items)
    };
    return response;
}
