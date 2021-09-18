const dynamodb = require('aws-sdk/clients/dynamodb');
const { v4: uuidv4 } = require('uuid');
const docClient = new dynamodb.DocumentClient();

const tableName = process.env.TRAINING_PLAN_TABLE;

const expressionAttributeNames = {
    "#nm": "name",
    "#active": "active"
}

export const getTrainingPlansForUser = async function (userId: any) {
    var params = {
        TableName : tableName,
        ProjectionExpression:`userId, id, ${Object.keys(expressionAttributeNames).join(', ')}`,
        FilterExpression: "userId = :contextUserId",
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: {
            ":contextUserId": userId
        }
    };

    const data = await docClient.scan(params).promise();
    return data.Items;
}
    
export const getTrainingPlan = async function (userId: any, planId: any) {
    var params = {
        TableName : tableName,
        Key: { 
            id: planId,
            userId: userId
        }
        };
        const data = await docClient.get(params).promise();
        return data.Item;
}
export const createTrainingPlan = async function (userId: any, newItem: any) {
    const newTableItem = { 
        id : uuidv4(),
        userId: userId,
        name: newItem.name,
        active: newItem.active
    }

    var params = {
        TableName : tableName,
        Item: newTableItem
    };

    await docClient.put(params).promise();
    return newTableItem;
}

export const updateTrainingPlan = async function (itemUpdate: any) {
    const updateTableItem = {
        id: itemUpdate.id,
        userId: itemUpdate.userId,
        name: itemUpdate.name,
        active: itemUpdate.active
    };
    
    var updateParams = {
        TableName: tableName,
        Item: updateTableItem
    };

    await docClient.put(updateParams).promise();
}

export const deleteTrainingPlan = async function (userId: any, planId: any) {
    var deleteParams = {
        TableName : tableName,
        Key: { 
            id: planId,
            userId: userId
        }
    };

    await docClient.delete(deleteParams).promise();
}
