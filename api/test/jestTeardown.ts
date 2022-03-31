import { REDIS_CLIENT } from '../src/caches/GenericCache'

// This is to prevent hanging handles
afterAll(() => REDIS_CLIENT.quit())
