const dynamodb = require('aws-sdk/clients/dynamodb');
const { v4: uuidv4 } = require('uuid');
const docClient = new dynamodb.DocumentClient();

const tableName = process.env.TRAINING_PLAN_ACTIVITY_TABLE;

const expressionAttributeNames = {
    "#nm": "name",
    "#acttime": "activityTime",
    "#segments": "segments",
    "#complete": "complete"
}

export const getTrainingPlanActivitiesForTrainingPlan = async function (planId: any) {
        
        var params = {
            TableName : tableName,
            ProjectionExpression:`trainingPlanId, id, ${Object.keys(expressionAttributeNames).join(', ')}`,
            FilterExpression: "trainingPlanId = :contextPlanId",            
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: {
                ":contextPlanId": planId
            }
        };

        const data = await docClient.scan(params).promise();
        return data.Items;
    }
    
export const getTrainingPlanActivity = async function (planId: any, activityId: any) {
    var params = {
        TableName : tableName,
        Key: { 
            trainingPlanId: planId,
            id: activityId
        }
        };
        const data = await docClient.get(params).promise();
        return data.Item;
}
export const createTrainingPlanActivity = async function (planId: any, newItem: any) {
    const newTableItem = { 
        id : uuidv4(),
        trainingPlanId: planId,
        name: newItem.name,
        activityTime: newItem.activityTime,
        segments: newItem.segments,
        complete: newItem.complete
    }

    var params = {
        TableName : tableName,
        Item: newTableItem
    };

    await docClient.put(params).promise();
    return newTableItem;
}

export const updateTrainingPlanActivity = async function (itemUpdate: any) {
    const updateTableItem = {
        id: itemUpdate.id,
        trainingPlanId: itemUpdate.trainingPlanId,
        name: itemUpdate.name,
        activityTime: itemUpdate.activityTime,
        segments: itemUpdate.segments,
        complete: itemUpdate.complete
    };
    
    var updateParams = {
        TableName: tableName,
        Item: updateTableItem
    };

    await docClient.put(updateParams).promise();
}

export const deleteTrainingPlanActivity = async function (planId: any, activityId: any) {
    var deleteParams = {
        TableName : tableName,
        Key: { 
            id: activityId,
            trainingPlanId: planId
        }
    };

    await docClient.delete(deleteParams).promise();
}
