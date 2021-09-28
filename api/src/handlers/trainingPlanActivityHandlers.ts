import { accessControlHeaders } from '../helpers/requiredHeaders';
import { TrainingPlanRepository } from '../repositories/trainingPlanRepository';
import { TrainingPlanActivityRepository } from '../repositories/trainingPlanActivityRepository';

const trainingPlanRepository = new TrainingPlanRepository();
const trainingPlanActivityRepository = new TrainingPlanActivityRepository();

export const activityCreate = async (event: any) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    const { trainingPlanId } = event.pathParameters;
    const userId = event.requestContext.authorizer.claims.sub

    const existing = await trainingPlanRepository.getTrainingPlan(userId, trainingPlanId);

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${trainingPlanId}`);
    }

    const body = JSON.parse(event.body)

    let newItem = await trainingPlanActivityRepository.createTrainingPlanActivity(trainingPlanId, body)

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

    const existing = await trainingPlanRepository.getTrainingPlan(userId, trainingPlanId);

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${activityId}`);
    }

    const existingActivity = await trainingPlanActivityRepository.getTrainingPlanActivity(trainingPlanId, activityId)

    if (!existingActivity || existingActivity.trainingPlanId !== trainingPlanId) {
        throw new Error(`No item for user ${activityId} found under ${trainingPlanId}`);
    }

    await trainingPlanActivityRepository.deleteTrainingPlanActivity(trainingPlanId, activityId);

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

    const existing = await trainingPlanRepository.getTrainingPlan(userId, trainingPlanId);

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${trainingPlanId}`);
    }

    let items = await trainingPlanActivityRepository.getTrainingPlanActivitiesForTrainingPlan(trainingPlanId);

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

    const existing = await trainingPlanRepository.getTrainingPlan(userId, trainingPlanId);

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${trainingPlanId}`);
    }

    const activity = await trainingPlanActivityRepository.getTrainingPlanActivity(trainingPlanId, activityId)

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

    const existing = await trainingPlanRepository.getTrainingPlan(userId, trainingPlanId);

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${trainingPlanId}`);
    }

    const existingActivity = await trainingPlanActivityRepository.getTrainingPlanActivity(trainingPlanId, activityId)

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

    await trainingPlanActivityRepository.updateTrainingPlanActivity(itemUpdate)

    const response = {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(itemUpdate)
    };
    return response;
}
