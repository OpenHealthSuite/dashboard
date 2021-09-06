const { accessControlHeaders } = require('../helpers/requiredHeaders');
const { createTrainingPlan, getTrainingPlan, deleteTrainingPlan, getTrainingPlansForUser, updateTrainingPlan } = require('../repositories/trainingPlanRepository');

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

exports.planUpdate = async (event) => {
    if (event.httpMethod !== 'PUT') {
        throw new Error(`only accepts PUT method, you tried: ${event.httpMethod} method.`);
    }
    const userId = event.requestContext.authorizer.claims.sub

    const body = JSON.parse(event.body)
    const id = event.pathParameters.id;
    const { name, active } = body;

    const existing = await getTrainingPlan(userId, id)

    if (!existing || existing.userId !== userId) {
        throw new Error(`No item with ${id} found`);
    }

    const itemUpdate = {
        id: id,
        userId: userId,
        name: name,
        active: active
    }

    await updateTrainingPlan(itemUpdate)

    const response = {
        statusCode: 200,
        headers: accessControlHeaders,
        body: JSON.stringify(itemUpdate)
    };
    return response;
}
