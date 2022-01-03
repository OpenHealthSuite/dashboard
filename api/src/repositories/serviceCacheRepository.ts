import { BaseDynamoPartitionSortRepository } from './baseDynamoPartitionSortRepository'

export interface ICachedResponse {
    userId: string,
    url: string,
    serialisedResponse: string,
    date: Date
}

export class ServiceCacheRepository extends BaseDynamoPartitionSortRepository<ICachedResponse> {
  constructor () {
    super(
      process.env.SERVICE_CACHE_TABLE ?? 'ServiceCache',
      'userId',
      'url',
      {
        '#response': 'response',
        '#date': 'date'
      }
    )
  }

  async GetResponse (userId: string, url: string): Promise<ICachedResponse> {
    return await this.getByPartitionAndSortKeys(userId, url)
  }

  async SaveResponse (userId: string, url: string, serialisedResponse: string) {
    return await this.update({ userId, url, serialisedResponse, date: new Date() })
  }
}
