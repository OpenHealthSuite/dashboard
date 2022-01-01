import { BaseDynamoPartitionSortRepository } from './baseDynamoPartitionSortRepository'

export interface IUserServiceToken {
    userId: string,
    serviceId: string,
    token: any
}

export class UserServiceTokenRepository extends BaseDynamoPartitionSortRepository<IUserServiceToken> {
  constructor () {
    super(
      process.env.USER_SERVICE_TOKEN_TABLE ?? 'UserServiceToken',
      'userId',
      'serviceId',
      {
        '#token': 'token'
      }
    )
  }
}
