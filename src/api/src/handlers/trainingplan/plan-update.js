const { accessControlHeaders } = require('../../helpers/requiredHeaders');
const { getTrainingPlan, updateTrainingPlan } = require('../../repositories/trainingPlanRepository');

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

    const existing = await getTrainingPlan(userId, id)

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item with ${id} found`);
    }

    const itemUpdate = { 
        id : id,
        userId: userId,
        name: name 
    }
    
    await updateTrainingPlan(itemUpdate)

    const response = {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(itemUpdate)
    };
    return response;
}
