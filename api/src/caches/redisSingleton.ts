import IORedis from 'ioredis'

class RedisSingleton {
  public connection: IORedis.Redis
  constructor () {
    this.connection = new IORedis(parseInt(process.env.REDIS_PORT ?? '6379'), process.env.REDIS_HOST ?? 'localhost')
  }
}

export default new RedisSingleton()
