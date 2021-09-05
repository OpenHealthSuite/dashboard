const { accessControlHeaders } = require('../../helpers/requiredHeaders');
const { createTrainingPlan } = require('../../repositories/trainingPlanRepository');

/**
 * A simple example includes a HTTP post method to create a new training plan
 */
exports.planCreate = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    
    const userId = event.requestContext.authorizer.claims.sub
    const body = JSON.parse(event.body)

    let newItem = await createTrainingPlan(userId, body)

    const response = {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(newItem)
    };

    return response;
}
