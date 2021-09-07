const { accessControlHeaders } = require('../helpers/requiredHeaders');
const { getTrainingPlan } = require('../repositories/trainingPlanRepository');
const { getTrainingPlanActivitiesForTrainingPlan, getTrainingPlanActivity, createTrainingPlanActivity, updateTrainingPlanActivity, deleteTrainingPlanActivity } = require('../repositories/trainingPlanActivityRepository');

exports.activityCreate = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    const { trainingPlanId } = event.pathParameters;
    const userId = event.requestContext.authorizer.claims.sub

    const existing = await getTrainingPlan(userId, trainingPlanId);

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${id}`);
    }

    const body = JSON.parse(event.body)

    let newItem = await createTrainingPlanActivity(trainingPlanId, body)

    const response = {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(newItem)
    };

    return response;
}

exports.activityDelete = async (event) => {
    if (event.httpMethod !== 'DELETE') {
        throw new Error(`only accepts DELETE method, you tried: ${event.httpMethod} method.`);
    }

    const userId = event.requestContext.authorizer.claims.sub

    const { trainingPlanId, activityId } = event.pathParameters;

    const existing = await getTrainingPlan(userId, trainingPlanId);

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${id}`);
    }

    const existingActivity = await getTrainingPlanActivity(trainingPlanId, activityId)

    if (!existingActivity || existingActivity.trainingPlanId !== trainingPlanId) {
        throw new Error(`No item for user ${activityId} found under ${trainingPlanId}`);
    }

    await deleteTrainingPlanActivity(trainingPlanId, activityId);

    const response = {
        statusCode: 200,
        headers: accessControlHeaders
    };

    return response;
}

exports.activityGetAll = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
    }

    const userId = event.requestContext.authorizer.claims.sub

    const { trainingPlanId } = event.pathParameters;

    const existing = await getTrainingPlan(userId, trainingPlanId);

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${id}`);
    }

    let items = await getTrainingPlanActivitiesForTrainingPlan(trainingPlanId);

    const response = {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(items)
    };
    return response;
}

exports.activityGet = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
    }
    const userId = event.requestContext.authorizer.claims.sub

    const { trainingPlanId, activityId } = event.pathParameters;

    const existing = await getTrainingPlan(userId, trainingPlanId);

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${id}`);
    }

    const activity = getTrainingPlanActivity(trainingPlanId, activityId)

    return {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(activity)
    };
}

exports.activityUpdate = async (event) => {
    if (event.httpMethod !== 'PUT') {
        throw new Error(`only accepts PUT method, you tried: ${event.httpMethod} method.`);
    }
    const userId = event.requestContext.authorizer.claims.sub

    const { trainingPlanId, activityId } = event.pathParameters;

    const body = JSON.parse(event.body)
    const { name, activityTime, segments, complete } = body;

    const existing = await getTrainingPlan(userId, trainingPlanId);

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${id}`);
    }

    const existingActivity = await getTrainingPlanActivity(trainingPlanId, activityId)

    if (!existingActivity || existingActivity.trainingPlanId !== trainingPlanId) {
        throw new Error(`No item for user ${activityId} found under ${trainingPlanId}`);
    }

    const itemUpdate = {
        id: activityId,
        trainingPlanId: trainingPlanId,
        name: name,
        activityTime: activityTime,
        segments: segments,
        complete: complete
    }

    await updateTrainingPlanActivity(itemUpdate)

    const response = {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(itemUpdate)
    };
    return response;
}
