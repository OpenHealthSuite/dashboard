const { accessControlHeaders } = require('../../helpers/requiredHeaders');
const { getTrainingPlan, deleteTrainingPlan } = require('../../repositories/trainingPlanRepository');
/**
 * Delete a training plan
 */
exports.planDelete = async (event) => {
    if (event.httpMethod !== 'DELETE') {
        throw new Error(`only accepts DELETE method, you tried: ${event.httpMethod} method.`);
    }

    const userId = event.requestContext.authorizer.claims.sub

    const id = event.pathParameters.id;

    const existing = await getTrainingPlan(userId, id);

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${id}`);
    }

    await deleteTrainingPlan(userId, id);

    const response = {
        statusCode: 200,
        headers: accessControlHeaders
    };

    return response;
}
