import { accessControlHeaders } from '../helpers/requiredHeaders';
import { TrainingPlanRepository } from '../repositories/trainingPlanRepository';

export const planCreate = async (event: any) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    const userId = event.requestContext.authorizer.claims.sub
    const body = JSON.parse(event.body)

    let repository = new TrainingPlanRepository();

    let newItem = await repository.createTrainingPlan(userId, body)

    const response = {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(newItem)
    };

    return response;
}

export const planDelete = async (event: any) => {
    if (event.httpMethod !== 'DELETE') {
        throw new Error(`only accepts DELETE method, you tried: ${event.httpMethod} method.`);
    }

    const userId = event.requestContext.authorizer.claims.sub

    const id = event.pathParameters.trainingPlanId;

    let repository = new TrainingPlanRepository();

    const existing = await repository.getTrainingPlan(userId, id);

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item for user ${userId} found under ${id}`);
    }

    await repository.deleteTrainingPlan(userId, id);

    const response = {
        statusCode: 200,
        headers: accessControlHeaders
    };

    return response;
}

export const planGetAll = async (event: any) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
    }

    const userId = event.requestContext.authorizer.claims.sub

    let repository = new TrainingPlanRepository();

    let items = await repository.getTrainingPlansForUser(userId);

    const response = {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(items)
    };
    return response;
}

export const planGet = async (event: any) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
    }
    const userId = event.requestContext.authorizer.claims.sub

    // Get id from pathParameters from APIGateway because of `/{id}` at template.yml
    const id = event.pathParameters.trainingPlanId;

    let repository = new TrainingPlanRepository();

    let plan = await repository.getTrainingPlan(userId, id);

    if (!plan || plan.userId !== userId) {
        throw new Error(`No item with ${id} found`);
    }

    return {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(plan)
    };
}

export const planUpdate = async (event: any) => {
    if (event.httpMethod !== 'PUT') {
        throw new Error(`only accepts PUT method, you tried: ${event.httpMethod} method.`);
    }
    const userId = event.requestContext.authorizer.claims.sub

    const body = JSON.parse(event.body)
    const id = event.pathParameters.trainingPlanId;
    const { name, active } = body;

    let repository = new TrainingPlanRepository();

    const existing = await repository.getTrainingPlan(userId, id)

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item with ${id} found`);
    }

    const itemUpdate = {
        id: id,
        userId: userId,
        name: name,
        active: active
    }

    await repository.updateTrainingPlan(itemUpdate)

    const response = {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(itemUpdate)
    };
    return response;
}
