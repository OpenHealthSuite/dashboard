import * as dynamodb from 'aws-sdk/clients/dynamodb'

export abstract class BaseDynamoRepository {
    protected readonly _docClient: dynamodb.DocumentClient;

    constructor () {
      if (process.env.DYNAMO_ENDPOINT) {
        this._docClient = new dynamodb.DocumentClient({
          endpoint: process.env.DYNAMO_ENDPOINT,
          region: process.env.AWS_REGION ?? 'eu-west-2'
        })
      } else {
        this._docClient = new dynamodb.DocumentClient({
          region: process.env.AWS_REGION ?? 'eu-west-2'
        })
      }
    }
}
