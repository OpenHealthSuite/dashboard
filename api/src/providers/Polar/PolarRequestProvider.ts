import { Application, Request, Response } from 'express'
import { userRestrictedHandler } from '../../utilities/UserRestrictedHandler'
import { Axios } from 'axios'
import { UserServiceTokenRepository } from '../../repositories/userServiceTokenRepository'
import * as GenericCache from '../../caches/GenericCache'
import { DashboardLocals } from '../..'

const AXIOS = new Axios({})

export interface IPolarSettings {
  clientId: string,
  clientSecret: string,
  authUrl: string,
  tokenUrl: string,
  rootApiUrl: string,
  cacheExpiryMilliseconds: number
}

const POLAR_SETTINGS: IPolarSettings = {
  clientId: process.env.POLAR_CLIENT_ID ?? 'PolarClientId',
  clientSecret: process.env.POLAR_CLIENT_SECRET ?? 'PolarClientSecret',
  authUrl: 'https://flow.polar.com/oauth2/authorization',
  tokenUrl: 'https://polarremote.com/v2/oauth2/token',
  rootApiUrl: 'https://www.polaraccesslink.com',
  cacheExpiryMilliseconds: 300000
}

export interface IPolarTokenResponse {
  // eslint-disable-next-line camelcase
  access_token: string,
  // eslint-disable-next-line camelcase
  expires_in: number,
  // eslint-disable-next-line camelcase
  token_type: string,
  // eslint-disable-next-line camelcase
  x_user_id: string
}

const POLAR_TOKEN_REPO = new UserServiceTokenRepository<IPolarTokenResponse>('polar')
const SERVICE_CACHE_KEY = 'servicecache:polar'

export function addPolarHandlers (app: Application) {
  app.post('/api/users/:userId/providers/polar/start', (req, res: Response<any, DashboardLocals>) => userRestrictedHandler(req, res, startAuthenticationFlow))
  app.post('/api/users/:userId/providers/polar/redeem', (req, res: Response<any, DashboardLocals>) => userRestrictedHandler(req, res, redeemCode))
}

export async function startAuthenticationFlow (
  _userId: string,
  _req: Request,
  res: Response,
  polarSettings: IPolarSettings = POLAR_SETTINGS
) {
  const authUrl = `${polarSettings.authUrl}?client_id=${polarSettings.clientId}&response_type=code`
  return res.send({ authUrl })
}

export async function redeemCode (
  userId: string,
  req: Request,
  res: Response,
  axios: Axios = AXIOS,
  polarSettings: IPolarSettings = POLAR_SETTINGS,
  polarTokenRepo: UserServiceTokenRepository<IPolarTokenResponse> = POLAR_TOKEN_REPO
) {
  const { code } = req.body
  const tokenParameters = {
    code,
    grant_type: 'authorization_code'
  }
  const headers = {
    authorization: `Basic ${Buffer.from(`${polarSettings.clientId}:${polarSettings.clientSecret}`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json'
  }
  const response = await axios.post(polarSettings.tokenUrl, '', { params: tokenParameters, headers })
  if (response.status !== 200) { return res.send({ status: 'err' }).status(400) }
  const token: IPolarTokenResponse = JSON.parse(response.data) // date_retrieved: (new Date()).toISOString()
  const storage = await polarTokenRepo.createUserToken(userId, token)
  storage.map(() => res.send({ status: 'ok' }))
    .mapErr((err: any) => {
      console.error(err)
      res.sendStatus(500)
    })
}

export async function makePolarRequest<T> (
  userId: string,
  url: string,
  axios: Axios = AXIOS,
  polarSettings: IPolarSettings = POLAR_SETTINGS,
  GetCache: (key: string) => Promise<GenericCache.GenericCacheValue<string> | undefined> = GenericCache.GetByKey,
  SaveCache: (key: string, value: string) => Promise<void> = GenericCache.SaveOnKey,
  fnGetPolarToken: (userId: string) => Promise<IPolarTokenResponse | null> = getPolarToken
): Promise<T | undefined> {
  const requestUrl = polarSettings.rootApiUrl + url
  const cachedValue = await GetCache(`${SERVICE_CACHE_KEY}:${userId}:${requestUrl}`)
  if (cachedValue && cachedValue.value && new Date(cachedValue.date).getTime() > ((new Date()).getTime() - polarSettings.cacheExpiryMilliseconds)) {
    return JSON.parse(cachedValue.value) as T
  }
  const token = await fnGetPolarToken(userId)
  if (!token) { return undefined }
  const polarResponse = await axios.get(requestUrl, {
    headers: {
      authorization: `Bearer ${token.access_token}`,
      Accept: 'application/json'
    }
  })
  if (polarResponse.status !== 200) {
    return undefined
  }
  SaveCache(`${SERVICE_CACHE_KEY}:${userId}:${requestUrl}`, polarResponse.data)
  return JSON.parse(polarResponse.data) as T
}

export async function getPolarToken (
  userId: string,
  polarTokenRepo: UserServiceTokenRepository<IPolarTokenResponse> = POLAR_TOKEN_REPO
): Promise<IPolarTokenResponse | null> {
  const storedToken = await (await polarTokenRepo.getUserToken(userId)).unwrapOr(null)
  if (!storedToken) {
    return null
  }
  // TODO: Check if tokent has expired and just return null
  return storedToken.raw_token
}
