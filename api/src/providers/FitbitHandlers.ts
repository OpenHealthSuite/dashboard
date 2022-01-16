import { Application, Request, Response } from 'express'
import { userRestrictedHandler } from '../utilities/UserRestrictedHandler'
import { createHash, randomBytes } from 'crypto'
import { Axios } from 'axios'
import { UserServiceTokenRepository } from '../repositories/userServiceTokenRepository'
import { ServiceCacheRepository } from '../repositories/serviceCacheRepository'

const axios = new Axios()

const FITBIT_SETTINGS = {
  clientId: process.env.FITBIT_CLIENT_ID,
  clientSecret: process.env.FITBIT_CLIENT_SECRET,
  authUrl: 'https://www.fitbit.com/oauth2/authorize',
  tokenUrl: 'https://api.fitbit.com/oauth2/token',
  rootApiUrl: 'https://api.fitbit.com',
  cacheExpiryMilliseconds: 300000
}

const SERVICE_KEY = 'fitbit'

interface IFitbitTokenResponse {
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

interface IFitbitTokenDetails extends IFitbitTokenResponse {
  // eslint-disable-next-line camelcase
  date: Date
}

const FITBIT_TOKEN_REPO = new UserServiceTokenRepository<IFitbitTokenDetails>(SERVICE_KEY)
const SERVICE_CACHE = new ServiceCacheRepository()

export function addFitbitHandlers (app: Application) {
  app.post('/users/:userId/providers/fitbit/start', (req, res) => userRestrictedHandler(req, res, startAuthenticationFlow))
  app.post('/users/:userId/providers/fitbit/redeem', (req, res) => userRestrictedHandler(req, res, redeemCode))
}

const CODE_VERIFIERS: {[key:string]: string} = {}

function startAuthenticationFlow (userId: string, req: Request, res: Response) {
  CODE_VERIFIERS[userId] = randomBytes(60).toString('hex')
  // This generated + where the example had - : if there are issues, check that
  const challengeHash = createHash('sha256').update(CODE_VERIFIERS[userId]).digest('base64').replace('=', '')

  const authUrl = `https://www.fitbit.com/oauth2/authorize?client_id=${FITBIT_SETTINGS.clientId}&response_type=code` +
  `&code_challenge=${challengeHash}&code_challenge_method=S256` +
  '&scope=weight%20location%20settings%20profile%20nutrition%20activity%20sleep' +
  '%20heartrate%20social'
  return res.send({ authUrl })
}

async function redeemCode (userId: string, req: Request, res: Response): Promise<void> {
  const { code } = req.body
  const codeVerifier = CODE_VERIFIERS[userId]
  const tokenRequest = {
    client_id: FITBIT_SETTINGS.clientId,
    code: code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code'
  }
  const response = await axios.post(FITBIT_SETTINGS.tokenUrl, tokenRequest, {
    headers: {
      authorization: `Basic ${Buffer.from(`${FITBIT_SETTINGS.clientId}:${FITBIT_SETTINGS.clientSecret}`).toString('base64')}`
    }
  })
  const responseData: IFitbitTokenResponse = response.data
  const token: IFitbitTokenDetails = { ...responseData, date: new Date() }
  await FITBIT_TOKEN_REPO.updateUserToken(userId, token)
  res.sendStatus(200)
}

export async function makeFitbitRequest<T> (userId: string, url: string): Promise<T> {
  const requestUrl = FITBIT_SETTINGS.rootApiUrl + url
  const cachedValue = await SERVICE_CACHE.GetResponse(userId, requestUrl)
  if (cachedValue && cachedValue.date.getTime() < ((new Date()).getTime() - FITBIT_SETTINGS.cacheExpiryMilliseconds)) {
    return JSON.parse(cachedValue.serialisedResponse) as T
  }
  const token = await getFitbitToken(userId)
  if (!token) { throw new Error('No Fitbit Token') }
  const fitbitResponse = await axios.get(requestUrl, {
    headers: {
      authorization: `Bearer ${token.access_token}`
    }
  })
  SERVICE_CACHE.SaveResponse(userId, requestUrl, JSON.stringify(fitbitResponse.data))
  return fitbitResponse.data as T
}

export async function getFitbitToken (userId: string): Promise<IFitbitTokenDetails | null> {
  const storedToken = await FITBIT_TOKEN_REPO.getUserToken(userId)
  if (!storedToken) {
    return null
  }
  if ((new Date()).getTime() > (storedToken.date.getTime() + (storedToken.expires_in * 1000))) {
    return await refreshedToken(userId, storedToken)
  }
  return storedToken
}

async function refreshedToken (userId: string, storedToken: IFitbitTokenDetails): Promise<IFitbitTokenDetails> {
  const tokenRequest = {
    client_id: FITBIT_SETTINGS.clientId,
    grant_type: 'refresh_token',
    refresh_token: storedToken.refresh_token
  }
  const response = await axios.post(FITBIT_SETTINGS.tokenUrl, tokenRequest, {
    headers: {
      authorization: `Basic ${Buffer.from(`${FITBIT_SETTINGS.clientId}:${FITBIT_SETTINGS.clientSecret}`).toString('base64')}`
    }
  })
  const responseData: IFitbitTokenResponse = response.data
  const token: IFitbitTokenDetails = { ...responseData, date: new Date() }
  await FITBIT_TOKEN_REPO.updateUserToken(userId, token)
  return token
}
