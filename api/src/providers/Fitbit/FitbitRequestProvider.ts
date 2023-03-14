import { Application, Request, Response } from 'express'
import { userRestrictedHandler } from '../../utilities/UserRestrictedHandler'
import { createHash, randomBytes } from 'crypto'
import { Axios } from 'axios'
import { UserServiceTokenRepository } from '../../repositories/userServiceTokenRepository'
import * as GenericCache from '../../caches/GenericCache'
import { DashboardLocals } from '../..'

const AXIOS = new Axios({})

export interface IFitbitSettings {
  clientId: string,
  clientSecret: string,
  authUrl: string,
  tokenUrl: string,
  rootApiUrl: string,
  neededScopes: string[],
  cacheExpiryMilliseconds: number
}

const FITBIT_SETTINGS: IFitbitSettings = {
  clientId: process.env.FITBIT_CLIENT_ID ?? 'FitbitClientId',
  clientSecret: process.env.FITBIT_CLIENT_SECRET ?? 'FitbitClientSecret',
  authUrl: 'https://www.fitbit.com/oauth2/authorize',
  tokenUrl: 'https://api.fitbit.com/oauth2/token',
  rootApiUrl: 'https://api.fitbit.com',
  neededScopes: [
    'weight',
    'location',
    'settings',
    'profile',
    'nutrition',
    'activity',
    'sleep',
    'heartrate',
    'social'
  ],
  cacheExpiryMilliseconds: 300000
}

export interface IFitbitTokenResponse {
  // eslint-disable-next-line camelcase
  access_token: string,
  // eslint-disable-next-line camelcase
  expires_in: number,
  // eslint-disable-next-line camelcase
  refresh_token: string,
  scope: string,
  // eslint-disable-next-line camelcase
  token_type: string,
  // eslint-disable-next-line camelcase
  user_id: string
}

const FITBIT_TOKEN_REPO = new UserServiceTokenRepository('fitbit')
const SERVICE_CACHE_KEY = 'servicecache:fitbit'
const CODE_CHALLENGE_CACHE = 'codechallengecache:fitbit'

export function addFitbitHandlers (app: Application) {
  app.post('/api/users/:userId/providers/fitbit/start', (req, res: Response<any, DashboardLocals>) => userRestrictedHandler(req, res, startAuthenticationFlow))
  app.post('/api/users/:userId/providers/fitbit/redeem', (req, res: Response<any, DashboardLocals>) => userRestrictedHandler(req, res, redeemCode))
}

function randomString (size: number): string {
  return randomBytes(size).toString('hex')
}

function createsha256String (input: string) {
  return createHash('sha256').update(input).digest('base64')
}

export async function startAuthenticationFlow (
  userId: string,
  _req: Request,
  res: Response,
  fitbitSettings: IFitbitSettings = FITBIT_SETTINGS,
  SetCache: (key: string, value: string) => Promise<void> = GenericCache.SaveOnKey,
  fnRandomString: (size: number) => string = randomString,
  fnCreatesha256String: (input: string) => string = createsha256String
) {
  const codeVerifier = fnRandomString(60)
  await SetCache(`${CODE_CHALLENGE_CACHE}:${userId}`, codeVerifier)
  // Apparently fitbit wants - instead of +?
  // https://dev.fitbit.com/build/reference/web-api/developer-guide/authorization/
  const challengeHash = encodeURIComponent(fnCreatesha256String(codeVerifier).replace('=', '').replace(/\+/g, '-'))
  const authUrl = `${fitbitSettings.authUrl}?client_id=${fitbitSettings.clientId}&response_type=code` +
    `&code_challenge=${challengeHash}&code_challenge_method=S256` +
    `&scope=${fitbitSettings.neededScopes.join('%20')}`
  return res.send({ authUrl })
}

export async function redeemCode (
  userId: string,
  req: Request,
  res: Response,
  axios: Axios = AXIOS,
  fitbitSettings: IFitbitSettings = FITBIT_SETTINGS,
  GetCache: (key: string) => Promise<GenericCache.GenericCacheValue<string> | undefined> = GenericCache.GetByKey,
  fitbitTokenRepo: UserServiceTokenRepository = FITBIT_TOKEN_REPO
) {
  const { code } = req.body
  const codeVerifier = await GetCache(`${CODE_CHALLENGE_CACHE}:${userId}`)
  const tokenParameters = {
    client_id: fitbitSettings.clientId,
    code,
    code_verifier: codeVerifier?.value,
    grant_type: 'authorization_code'
  }
  const headers = {
    authorization: `Basic ${Buffer.from(`${fitbitSettings.clientId}:${fitbitSettings.clientSecret}`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  // This is a bit trashy...
  const queryiedTokenUrl = fitbitSettings.tokenUrl + '?' +
    `client_id=${tokenParameters.client_id}&` +
    `code=${tokenParameters.code}&` +
    `code_verifier=${tokenParameters.code_verifier}&` +
    `grant_type=${tokenParameters.grant_type}`
  const response = await axios.post(queryiedTokenUrl, '', { headers })
  if (response.status !== 200) { return res.send({ status: 'err' }).status(400) }
  const token: IFitbitTokenResponse = JSON.parse(response.data) // date_retrieved: (new Date()).toISOString()
  const storage = await fitbitTokenRepo.createUserToken(userId, token)
  storage.map(() => res.send({ status: 'ok' }))
    .mapErr(err => {
      console.error(err)
      res.sendStatus(500)
    })
}

export async function makeFitbitRequest<T> (
  userId: string,
  url: string,
  axios: Axios = AXIOS,
  fitbitSettings: IFitbitSettings = FITBIT_SETTINGS,
  GetCache: (key: string) => Promise<GenericCache.GenericCacheValue<string> | undefined> = GenericCache.GetByKey,
  SaveCache: (key: string, value: string) => Promise<void> = GenericCache.SaveOnKey,
  fnGetFitbitToken: (userId: string) => Promise<IFitbitTokenResponse | null> = getFitbitToken
): Promise<T | undefined> {
  const requestUrl = fitbitSettings.rootApiUrl + url
  const cachedValue = await GetCache(`${SERVICE_CACHE_KEY}:${userId}:${requestUrl}`)
  if (cachedValue && cachedValue.value && new Date(cachedValue.date).getTime() > ((new Date()).getTime() - fitbitSettings.cacheExpiryMilliseconds)) {
    return JSON.parse(cachedValue.value) as T
  }
  const token = await fnGetFitbitToken(userId)
  if (!token) { return undefined }
  const fitbitResponse = await axios.get(requestUrl, {
    headers: {
      authorization: `Bearer ${token.access_token}`
    }
  })
  if (fitbitResponse.status !== 200) {
    return undefined
  }
  SaveCache(`${SERVICE_CACHE_KEY}:${userId}:${requestUrl}`, fitbitResponse.data)
  return JSON.parse(fitbitResponse.data) as T
}

export async function getFitbitToken (
  userId: string,
  fitbitTokenRepo: UserServiceTokenRepository = FITBIT_TOKEN_REPO
): Promise<IFitbitTokenResponse | null> {
  const storedToken = await (await fitbitTokenRepo.getUserToken(userId)).unwrapOr(null)
  if (!storedToken) {
    return null
  }
  return storedToken.raw_token
}

const defaultNowGenerator = () => new Date()

export async function refreshTokens (
  expiryOffestMs: number = 60 * 1000,
  fitbitSettings: IFitbitSettings = FITBIT_SETTINGS,
  fitbitTokenRepo: UserServiceTokenRepository = FITBIT_TOKEN_REPO,
  axios: Axios = AXIOS,
  nowGenerator: () => Date = defaultNowGenerator
): Promise<void> {
  const tokenExpiryTime = nowGenerator()
  tokenExpiryTime.setMilliseconds(tokenExpiryTime.getMilliseconds() + expiryOffestMs)
  const tokensNeedingRefreshing = await fitbitTokenRepo.getTokensThatExpireBefore(tokenExpiryTime)

  await tokensNeedingRefreshing.asyncMap(async tokens => {
    await Promise.allSettled(tokens.map(async token => {
      try {
        const response = await axios.post(fitbitSettings.tokenUrl, '', {
          params: {
            client_id: fitbitSettings.clientId,
            refresh_token: token.raw_token.refresh_token,
            grant_type: 'refresh_token'
          },
          headers: {
            authorization: `Basic ${Buffer.from(`${fitbitSettings.clientId}:${fitbitSettings.clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        if (response.status === 200) {
          const responseData: IFitbitTokenResponse = JSON.parse(response.data)
          await fitbitTokenRepo.updateUserToken(token.paceme_user_id, responseData)
        }
      // TODO: What do we do when it's not a 200?
      } catch (ex: any) {
      // TODO: Handle this
        console.log(ex)
      }
    }))
  })
}
