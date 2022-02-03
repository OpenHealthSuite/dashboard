import { BaseRedisCache } from './baseRedisCache'

export class CodeChallenceCache extends BaseRedisCache {
  constructor () {
    super('codechallengecache')
  }

  async GetCode (userId: string): Promise<string> {
    const cachedValue = await this.BaseGetResponse(userId)
    return cachedValue.cachedValue
  }

  async SetCode (userId: string, code: string) {
    return await this.BaseSaveResponse(userId, code)
  }
}
