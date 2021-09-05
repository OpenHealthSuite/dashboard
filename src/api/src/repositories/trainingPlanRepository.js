const dynamodb = require('aws-sdk/clients/dynamodb');
const { v4: uuidv4 } = require('uuid');
const docClient = new dynamodb.DocumentClient();

const tableName = process.env.TRAINING_PLAN_TABLE;

module.exports = {
    /**
     * 
     * @param {string} userId 
     * @returns 
     */
    getTrainingPlansForUser: async function (userId) {
        var params = {
            TableName : tableName,
            ProjectionExpression:"userId, id, #nm",
            FilterExpression: "userId = :contextUserId",
            ExpressionAttributeNames: {
                "#nm": "name",
            },
            ExpressionAttributeValues: {
                ":contextUserId": userId
            }
        };

        const data = await docClient.scan(params).promise();
        return data.Items;
    },
    
    getTrainingPlan: async function (userId, planId) {
        var params = {
            TableName : tableName,
            Key: { 
              id: planId,
              userId: userId
            }
          };
          const data = await docClient.get(params).promise();
          return data.Item;
    },
    createTrainingPlan: async function (userId, newItem) {
        const newTableItem = { 
            id : uuidv4(),
            userId: userId,
            ...newItem
        }
    
        var params = {
            TableName : tableName,
            Item: newTableItem
        };
    
        await docClient.put(params).promise();
        return newTableItem;
    },
    
    updateTrainingPlan: async function (userId, planId, itemUpdate) {
        const itemTableUpdate = { 
            id : planId,
            userId: userId,
            ...itemUpdate
        }
        
        var updateParams = {
            TableName: tableName,
            Key: { 
              id: itemTableUpdate.id,
              userId: itemTableUpdate.userId
            },
            UpdateExpression: "set #nm = :name",
            ExpressionAttributeNames: {
                "#nm": "name",
            },
            ExpressionAttributeValues:{
                ":name":itemTableUpdate.name,
            },
            ReturnValues:"UPDATED_NEW"
        };
    
        await docClient.put(updateParams).promise();
    },
    deleteTrainingPlan: async function (userId, planId) {
        var deleteParams = {
            TableName : tableName,
            Key: { 
              id: planId,
              userId: userId
            }
        };

        await docClient.delete(deleteParams).promise();
    }
}



