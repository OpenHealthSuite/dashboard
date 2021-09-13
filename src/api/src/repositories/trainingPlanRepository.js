const dynamodb = require('aws-sdk/clients/dynamodb');
const { v4: uuidv4 } = require('uuid');
const docClient = new dynamodb.DocumentClient();

const tableName = process.env.TRAINING_PLAN_TABLE;

const expressionAttributeNames = {
    "#nm": "name",
    "#active": "active"
}

const updateExpression = `set ${Object.keys(expressionAttributeNames).map(mapKeyToUpdateExpression).join(', ')}`

function mapKeyToUpdateExpression(key){
    return `${key} = :${expressionAttributeNames[key]}`
}

module.exports = {
    /**
     * 
     * @param {string} userId 
     * @returns 
     */
    getTrainingPlansForUser: async function (userId) {
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

        Object.values(expressionAttributeNames).forEach(field => {
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
        const updateTableItem = {
            id: itemUpdate.id,
            userId: itemUpdate.userId
        };

        Object.values(expressionAttributeNames).forEach(field => {
            updateTableItem[field] = itemUpdate[field]
        })
        
        var updateParams = {
            TableName: tableName,
            Item: updateTableItem
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



