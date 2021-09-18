import * as dynamodb from 'aws-sdk/clients/dynamodb';

interface LooseKeyObject {
    [key: string]: string
}

export class BaseDynamoRepository<T> {
    private readonly _tableName: string;
    private readonly _expressionAttributeNames = {}
    private readonly _partitionKey: string
    private readonly _sortKey?: string
    private readonly _docClient: dynamodb.DocumentClient;

    constructor(tableName: string, paritionKey: string, expressionAttributeNames: {}, sortKey?: string) {
        this._docClient = new dynamodb.DocumentClient()
        this._tableName = tableName
        this._partitionKey = paritionKey
        this._sortKey = sortKey
        this._expressionAttributeNames = expressionAttributeNames
    }

    protected async getAllByPartitionKey(partitionKey: string): Promise<T[]> {
        var params = {
            TableName: this._tableName,
            ProjectionExpression: `${this._partitionKey}, ${this._sortKey ? this._sortKey + "," : ""} ${Object.keys(this._expressionAttributeNames).join(', ')}`,
            FilterExpression: `${this._partitionKey} = :requestedPartitionKey`,
            ExpressionAttributeNames: this._expressionAttributeNames,
            ExpressionAttributeValues: {
                ":requestedPartitionKey": partitionKey
            }
        };

        const data = await this._docClient.scan(params).promise();
        return data.Items as T[];
    }

    protected async getByPartitionAndSortKeys(paritionKey: string, sortKey: string): Promise<T> {
        let key: LooseKeyObject = {};
        key[this._partitionKey] = paritionKey;
        key[this._sortKey as string] = sortKey;

        var params = {
            TableName: this._tableName,
            Key: key
        };

        const data = await this._docClient.get(params).promise();
        return data.Item as T;
    }

    protected async create(newItem: T): Promise<T> {
        var params = {
            TableName: this._tableName,
            Item: newItem
        };

        await this._docClient.put(params).promise();
        return newItem;
    }

    protected async update(itemUpdate: T): Promise<void> {

        var updateParams = {
            TableName: this._tableName,
            Item: itemUpdate
        };

        await this._docClient.put(updateParams).promise();
    }

    protected async deleteByPartitionAndSortKey(paritionKey: string, sortKey: string): Promise<void> {
        let key: LooseKeyObject = {};
        key[this._partitionKey] = paritionKey;
        key[this._sortKey as string] = sortKey;
        var deleteParams = {
            TableName: this._tableName,
            Key: key
        };

        await this._docClient.delete(deleteParams).promise();
    }
}
