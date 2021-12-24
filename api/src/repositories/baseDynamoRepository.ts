import * as dynamodb from 'aws-sdk/clients/dynamodb'

export abstract class BaseDynamoRepository {
    protected readonly _docClient: dynamodb.DocumentClient;

    constructor () {
      this._docClient = new dynamodb.DocumentClient({
        region: process.env.AWS_REGION ?? 'eu-west-2'
      })
    }
}
