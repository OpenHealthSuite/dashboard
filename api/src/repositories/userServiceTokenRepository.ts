import { GenericCache } from '../caches/GenericCache'
import { BaseDynamoPartitionSortRepository } from './baseDynamoPartitionSortRepository'

export interface IUserServiceToken<T> {
    userId: string,
    serviceId: string,
    token: T
}

export class UserServiceTokenRepository<T> extends BaseDynamoPartitionSortRepository<IUserServiceToken<T>> {
  private readonly SERVICE_ID: string;
  private readonly cache: GenericCache<T>;
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
    this.cache = new GenericCache<T>(`userServiceTokenCache:${serviceId}`)
  }

  async getUserToken (userId: string): Promise<T | undefined> {
    const cachedValue = await this.cache.GetByKey(userId)
    if (cachedValue) {
      return cachedValue.value
    }
    const result = await this.getByPartitionAndSortKeys(userId, this.SERVICE_ID)
    await this.cache.SaveOnKey(userId, result.token)
    return result ? result.token : undefined
  }

  async updateUserToken (userId: string, token: T) {
    await this.update({ userId, serviceId: this.SERVICE_ID, token })
    await this.cache.SaveOnKey(userId, token)
  }
}
