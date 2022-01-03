import { BaseDynamoPartitionSortRepository } from './baseDynamoPartitionSortRepository'

export interface IUserServiceToken<T> {
    userId: string,
    serviceId: string,
    token: T
}

export class UserServiceTokenRepository<T> extends BaseDynamoPartitionSortRepository<IUserServiceToken<T>> {
  private readonly SERVICE_ID: string;
  constructor (serviceId: string) {
    super(
      process.env.USER_SERVICE_TOKEN_TABLE ?? 'UserServiceToken',
      'userId',
      'serviceId',
      {
        '#token': 'token'
      }
    )
    this.SERVICE_ID = serviceId
  }

  async getUserToken (userId: string): Promise<T> {
    return await (await this.getByPartitionAndSortKeys(userId, this.SERVICE_ID)).token
  }

  async updateUserToken (userId: string, token: T) {
    await this.update({ userId, serviceId: this.SERVICE_ID, token })
  }
}
