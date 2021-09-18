import * as dynamodb from 'aws-sdk/clients/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface ITrainingPlan {
    id : string,
    userId: string,
    name: string,
    active: boolean
}

export class TrainingPlanRepository {
    private _tableName: string = process.env.TRAINING_PLAN_TABLE ?? "TrainingPlan";
    private _expressionAttributeNames = {
        "#nm": "name",
        "#active": "active"
    }
    private _docClient: dynamodb.DocumentClient;

    constructor() {
        this._docClient = new dynamodb.DocumentClient()
    }

    public async getTrainingPlansForUser (userId: string): Promise<ITrainingPlan[]> {
        var params = {
            TableName : this._tableName,
            ProjectionExpression:`userId, id, ${Object.keys(this._expressionAttributeNames).join(', ')}`,
            FilterExpression: "userId = :contextUserId",
            ExpressionAttributeNames: this._expressionAttributeNames,
            ExpressionAttributeValues: {
                ":contextUserId": userId
            }
        };
    
        const data = await this._docClient.scan(params).promise();
        return data.Items as ITrainingPlan[];
    }
        
    public async getTrainingPlan (userId: string, planId: string): Promise<ITrainingPlan> {
        var params = {
            TableName : this._tableName,
            Key: { 
                id: planId,
                userId: userId
            }
            };
            const data = await this._docClient.get(params).promise();
            return data.Item as ITrainingPlan;
    }
    
    public async createTrainingPlan (userId: string, newItem: ITrainingPlan): Promise<ITrainingPlan> {
        const newTableItem = { 
            id : uuidv4(),
            userId: userId,
            name: newItem.name,
            active: newItem.active
        }
    
        var params = {
            TableName : this._tableName,
            Item: newTableItem
        };
    
        await this._docClient.put(params).promise();
        return newTableItem;
    }
    
    public async updateTrainingPlan (itemUpdate: ITrainingPlan): Promise<void> {
        
        var updateParams = {
            TableName: this._tableName,
            Item: itemUpdate
        };
    
        await this._docClient.put(updateParams).promise();
    }
    
    public async deleteTrainingPlan (userId: string, planId: string): Promise<void> {
        var deleteParams = {
            TableName : this._tableName,
            Key: { 
                id: planId,
                userId: userId
            }
        };
    
        await this._docClient.delete(deleteParams).promise();
    }
}
