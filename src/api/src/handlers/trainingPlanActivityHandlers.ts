const { accessControlHeaders } = require('../helpers/requiredHeaders');
const { getTrainingPlan } = require('../repositories/trainingPlanRepository');
const { getTrainingPlanActivitiesForTrainingPlan, getTrainingPlanActivity, createTrainingPlanActivity, updateTrainingPlanActivity, deleteTrainingPlanActivity } = require('../repositories/trainingPlanActivityRepository');

export const activityCreate = async (event: any) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    const { trainingPlanId } = event.pathParameters;
    const userId = event.requestContext.authorizer.claims.sub

    const existing = await getTrainingPlan(userId, trainingPlanId);

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${trainingPlanId}`);
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

export const activityDelete = async (event: any) => {
    if (event.httpMethod !== 'DELETE') {
        throw new Error(`only accepts DELETE method, you tried: ${event.httpMethod} method.`);
    }

    const userId = event.requestContext.authorizer.claims.sub

    const { trainingPlanId, activityId } = event.pathParameters;

    const existing = await getTrainingPlan(userId, trainingPlanId);

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${activityId}`);
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

export const activityGetAll = async (event: any) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
    }

    const userId = event.requestContext.authorizer.claims.sub

    const { trainingPlanId } = event.pathParameters;

    const existing = await getTrainingPlan(userId, trainingPlanId);

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${trainingPlanId}`);
    }

    let items = await getTrainingPlanActivitiesForTrainingPlan(trainingPlanId);

    const response = {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(items)
    };
    return response;
}

export const activityGet = async (event: any) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
    }
    const userId = event.requestContext.authorizer.claims.sub

    const { trainingPlanId, activityId } = event.pathParameters;

    const existing = await getTrainingPlan(userId, trainingPlanId);

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${trainingPlanId}`);
    }

    const activity = getTrainingPlanActivity(trainingPlanId, activityId)

    return {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(activity)
    };
}

export const activityUpdate = async (event: any) => {
    if (event.httpMethod !== 'PUT') {
        throw new Error(`only accepts PUT method, you tried: ${event.httpMethod} method.`);
    }
    const userId = event.requestContext.authorizer.claims.sub

    const { trainingPlanId, activityId } = event.pathParameters;

    const body = JSON.parse(event.body)
    const { name, activityTime, segments, complete } = body;

    const existing = await getTrainingPlan(userId, trainingPlanId);

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${trainingPlanId}`);
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