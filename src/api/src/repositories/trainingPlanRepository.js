const dynamodb = require('aws-sdk/clients/dynamodb');
const { v4: uuidv4 } = require('uuid');
const docClient = new dynamodb.DocumentClient();

const tableName = process.env.TRAINING_PLAN_TABLE;

const editableFields = ["name"]

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
            userId: userId
        }

        editableFields.forEach(field => {
            newTableItem[field] = newItem[field]
        })
        
        var params = {
            TableName : tableName,
            Item: newTableItem
        };
    
        await docClient.put(params).promise();
        return newTableItem;
    },
    
    updateTrainingPlan: async function (itemUpdate) {
        
        var updateParams = {
            TableName: tableName,
            Key: { 
              id: itemUpdate.id,
              userId: itemUpdate.userId
            },
            UpdateExpression: "set #nm = :name",
            ExpressionAttributeNames: {
                "#nm": "name",
            },
            ExpressionAttributeValues:{
                ":name":itemUpdate.name,
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



