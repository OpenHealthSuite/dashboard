const dynamodb = require('aws-sdk/clients/dynamodb');
const { v4: uuidv4 } = require('uuid');
const docClient = new dynamodb.DocumentClient();

const tableName = process.env.TRAINING_PLAN_ACTIVITY_TABLE;

const expressionAttributeNames = {
    "#nm": "name",
    "#acttime": "activityTime"
}

const updateExpression = `set ${Object.keys(expressionAttributeNames).map(mapKeyToUpdateExpression).join(', ')}`

function mapKeyToUpdateExpression(key){
    return `${key} = :${expressionAttributeNames[key]}`
}

module.exports = {
    getTrainingPlanActivitiesForTrainingPlan: async function (planId) {
        
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
    },
    
    getTrainingPlanActivity: async function (planId, activityId) {
        var params = {
            TableName : tableName,
            Key: { 
              trainingPlanId: planId,
              id: activityId
            }
          };
          const data = await docClient.get(params).promise();
          return data.Item;
    },
    createTrainingPlanActivity: async function (planId, newItem) {
        const newTableItem = { 
            id : uuidv4(),
            trainingPlanId: planId
        }

        Object.values(expressionAttributeNames).forEach(value => {
            newTableItem[value] = newItem[value]
        })
        
        var params = {
            TableName : tableName,
            Item: newTableItem
        };
    
        await docClient.put(params).promise();
        return newTableItem;
    },
    
    updateTrainingPlanActivity: async function (itemUpdate) {
        var updateValues = {};

        Object.values(expressionAttributeNames).forEach(attr => {
            updateValues[":"+attr] = itemUpdate[attr]
        })

        var updateParams = {
            TableName: tableName,
            Key: { 
              id: itemUpdate.id,
              trainingPlanId: itemUpdate.trainingPlanId
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: updateValues,
            ReturnValues:"UPDATED_NEW"
        };
    
        await docClient.put(updateParams).promise();
    },

    deleteTrainingPlanActivity: async function (planId, activityId) {
        var deleteParams = {
            TableName : tableName,
            Key: { 
              id: activityId,
              trainingPlanId: planId
            }
        };

        await docClient.delete(deleteParams).promise();
    }
}



