import * as sinon from 'sinon'
import { stubInterface } from 'ts-sinon'
import { Request, Response } from 'express'
import {
  IFitbitSettings,
  makeFitbitRequest,
  refreshTokens,
  startAuthenticationFlow
} from './FitbitRequestProvider'
import { Axios } from 'axios'
import { ok } from 'neverthrow'

const CODE_CHALLENGE_CACHE = 'codechallengecache:fitbit'
const SERVICE_CACHE_KEY = 'servicecache:fitbit'

test('startAuthenticationFlow :: generates code, caches code, and returns authUrl', async () => {
  const testUserId = 'input-user-id-123'
  const req = stubInterface<Request>()
  const res = stubInterface<Response>()
  const fitbitSettings = stubInterface<IFitbitSettings>()
  fitbitSettings.clientId = 'FitbitClientId-456'
  fitbitSettings.authUrl = 'https://www.totallyrealfitbiturl.com/authorise'
  fitbitSettings.neededScopes = ['scope1', 'scope2', 'soimething']
  const expectedRawScopeParam = 'scope1%20scope2%20soimething'
  const expectedScopeParam = 'scope1 scope2 soimething'
  const codeChallengeCache = sinon.fake()
  const fakeRandomString = 'TotallyARandomStringasdkmasd123'
  const fakeEncodedString = 'ajdksfnWEQO-IDJQWDksdjfanlikdj-n312094u123'
  const fnRandomString = sinon.fake.returns(fakeRandomString)
  const fnCreatesha256String = sinon.fake.returns(fakeEncodedString)

  await startAuthenticationFlow(
    testUserId,
    req,
    res,
    fitbitSettings,
    codeChallengeCache,
    fnRandomString,
    fnCreatesha256String
  )

  expect(codeChallengeCache.calledOnceWithExactly(`${CODE_CHALLENGE_CACHE}:${testUserId}`, fakeRandomString)).toBeTruthy()
  const send = res.send.getCall(0).firstArg
  expect(send.authUrl).toBeTruthy()
  const authUrlString: string = send.authUrl
  expect(authUrlString.startsWith(fitbitSettings.authUrl)).toBeTruthy()
  expect(authUrlString).toContain(expectedRawScopeParam)
  const authUrl = new URL(authUrlString)
  expect(authUrl.searchParams.get('client_id')).toBe(fitbitSettings.clientId)
  expect(authUrl.searchParams.get('response_type')).toBe('code')
  expect(authUrl.searchParams.get('code_challenge')).toBe(fakeEncodedString)
  expect(authUrl.searchParams.get('code_challenge_method')).toBe('S256')
  expect(authUrl.searchParams.get('scope')).toBe(expectedScopeParam)
})

interface FakeData {
  somefield: string
}

test('makeFitbitRequest :: cached value, returns cached value does nothing else', async () => {
  const inputUserId = 'testUserId-123'
  const inputUrl = '/our/fake/endpoint'
  const inputAxios = sinon.createStubInstance(Axios)
  const fitbitSettings = stubInterface<IFitbitSettings>()
  fitbitSettings.rootApiUrl = 'http://www.mytotallyrealfitbiturl.com'
  fitbitSettings.cacheExpiryMilliseconds = 10000000000
  const getCache = sinon.stub()
  const setCache = sinon.stub()
  const unserialisedValue = { somefield: 'blahblahblah' }
  const returnedCacheValue = { value: JSON.stringify(unserialisedValue), date: new Date() }
  getCache.resolves(returnedCacheValue)
  const fnGetFitbitToken = sinon.fake.resolves({})

  const result = await makeFitbitRequest<FakeData>(
    inputUserId,
    inputUrl,
    inputAxios,
    fitbitSettings,
    getCache,
    setCache,
    fnGetFitbitToken
  )

  const expectedServiceCacheRequestUrl = fitbitSettings.rootApiUrl + inputUrl

  sinon.assert.calledOnceWithExactly(getCache, `${SERVICE_CACHE_KEY}:${inputUserId}:${expectedServiceCacheRequestUrl}`)
  expect(fnGetFitbitToken.notCalled).toBeTruthy()
  expect(inputAxios.get.notCalled).toBeTruthy()
  expect(setCache.notCalled).toBeTruthy()
  expect(result).toMatchObject(unserialisedValue)
})

test('makeFitbitRequest :: no cached value, asks fitbit for value', async () => {
  const inputUserId = 'testUserId-123'
  const inputUrl = '/our/fake/endpoint'
  const inputAxios = sinon.createStubInstance(Axios)
  const fitbitSettings = stubInterface<IFitbitSettings>()
  fitbitSettings.rootApiUrl = 'http://www.mytotallyrealfitbiturl.com'
  fitbitSettings.cacheExpiryMilliseconds = 0
  const getCache = sinon.stub()
  const setCache = sinon.stub()
  const unserialisedValue = { somefield: 'blahblahblah' }
  getCache.resolves(undefined)
  const fakeAccessToken = 'acces-token-12345'
  const fnGetFitbitToken = sinon.fake.resolves({ access_token: fakeAccessToken })
  inputAxios.get.resolves({ status: 200, data: JSON.stringify(unserialisedValue) })

  const result = await makeFitbitRequest<FakeData>(
    inputUserId,
    inputUrl,
    inputAxios,
    fitbitSettings,
    getCache,
    setCache,
    fnGetFitbitToken
  )

  const expectedServiceCacheRequestUrl = fitbitSettings.rootApiUrl + inputUrl

  sinon.assert.calledOnceWithExactly(getCache, `${SERVICE_CACHE_KEY}:${inputUserId}:${expectedServiceCacheRequestUrl}`)

  expect(fnGetFitbitToken.calledOnce).toBeTruthy()
  expect(fnGetFitbitToken.calledOnceWith(inputUserId)).toBeTruthy()

  expect(inputAxios.get.calledOnce).toBeTruthy()
  expect(inputAxios.get.calledOnceWith(expectedServiceCacheRequestUrl, { headers: { authorization: `Bearer ${fakeAccessToken}` } })).toBeTruthy()

  sinon.assert.calledOnceWithExactly(setCache, `${SERVICE_CACHE_KEY}:${inputUserId}:${expectedServiceCacheRequestUrl}`, JSON.stringify(unserialisedValue))

  expect(result).toMatchObject(unserialisedValue)
})

test('makeFitbitRequest :: outdated cached value, asks fitbit for value', async () => {
  const inputUserId = 'testUserId-123'
  const inputUrl = '/our/fake/endpoint'
  const inputAxios = sinon.createStubInstance(Axios)
  const fitbitSettings = stubInterface<IFitbitSettings>()
  fitbitSettings.rootApiUrl = 'http://www.mytotallyrealfitbiturl.com'
  fitbitSettings.cacheExpiryMilliseconds = 1000
  const getCache = sinon.stub()
  const setCache = sinon.stub()
  const unserialisedValue = { somefield: 'blahblahblah' }
  const returnedCacheValue = { serialisedResponse: JSON.stringify(unserialisedValue), date: new Date(1920, 12, 12) }
  getCache.resolves(returnedCacheValue)
  const fakeAccessToken = 'acces-token-12345'
  const fnGetFitbitToken = sinon.fake.resolves({ access_token: fakeAccessToken })
  inputAxios.get.resolves({ status: 200, data: JSON.stringify(unserialisedValue) })

  const result = await makeFitbitRequest<FakeData>(
    inputUserId,
    inputUrl,
    inputAxios,
    fitbitSettings,
    getCache,
    setCache,
    fnGetFitbitToken
  )

  const expectedServiceCacheRequestUrl = fitbitSettings.rootApiUrl + inputUrl

  sinon.assert.calledOnceWithExactly(getCache, `${SERVICE_CACHE_KEY}:${inputUserId}:${expectedServiceCacheRequestUrl}`)

  expect(fnGetFitbitToken.calledOnce).toBeTruthy()
  expect(fnGetFitbitToken.calledOnceWith(inputUserId)).toBeTruthy()

  expect(inputAxios.get.calledOnce).toBeTruthy()
  expect(inputAxios.get.calledOnceWith(expectedServiceCacheRequestUrl, { headers: { authorization: `Bearer ${fakeAccessToken}` } })).toBeTruthy()

  sinon.assert.calledOnceWithExactly(setCache, `${SERVICE_CACHE_KEY}:${inputUserId}:${expectedServiceCacheRequestUrl}`, JSON.stringify(unserialisedValue))

  expect(result).toMatchObject(unserialisedValue)
})

test('makeFitbitRequest :: outdated cached value, asks fitbit for value', async () => {
  const inputUserId = 'testUserId-123'
  const inputUrl = '/our/fake/endpoint'
  const inputAxios = sinon.createStubInstance(Axios)
  const fitbitSettings = stubInterface<IFitbitSettings>()
  fitbitSettings.rootApiUrl = 'http://www.mytotallyrealfitbiturl.com'
  fitbitSettings.cacheExpiryMilliseconds = 1000
  const getCache = sinon.stub()
  const setCache = sinon.stub()
  const unserialisedValue = { somefield: 'blahblahblah' }
  const returnedCacheValue = { serialisedResponse: JSON.stringify(unserialisedValue), date: new Date(1920, 12, 12) }
  getCache.resolves(returnedCacheValue)
  const fakeAccessToken = 'acces-token-12345'
  const fnGetFitbitToken = sinon.fake.resolves({ access_token: fakeAccessToken })
  inputAxios.get.resolves({ status: 200, data: JSON.stringify(unserialisedValue) })

  const result = await makeFitbitRequest<FakeData>(
    inputUserId,
    inputUrl,
    inputAxios,
    fitbitSettings,
    getCache,
    setCache,
    fnGetFitbitToken
  )

  const expectedServiceCacheRequestUrl = fitbitSettings.rootApiUrl + inputUrl

  sinon.assert.calledOnceWithExactly(getCache, `${SERVICE_CACHE_KEY}:${inputUserId}:${expectedServiceCacheRequestUrl}`)

  expect(fnGetFitbitToken.calledOnce).toBeTruthy()
  expect(fnGetFitbitToken.calledOnceWith(inputUserId)).toBeTruthy()

  expect(inputAxios.get.calledOnce).toBeTruthy()
  expect(inputAxios.get.calledOnceWith(expectedServiceCacheRequestUrl, { headers: { authorization: `Bearer ${fakeAccessToken}` } })).toBeTruthy()

  sinon.assert.calledOnceWithExactly(setCache, `${SERVICE_CACHE_KEY}:${inputUserId}:${expectedServiceCacheRequestUrl}`, JSON.stringify(unserialisedValue))

  expect(result).toMatchObject(unserialisedValue)
})

test('makeFitbitRequest :: no cached value, no token, returns undefined', async () => {
  const inputUserId = 'testUserId-123'
  const inputUrl = '/our/fake/endpoint'
  const inputAxios = sinon.createStubInstance(Axios)
  const fitbitSettings = stubInterface<IFitbitSettings>()
  fitbitSettings.rootApiUrl = 'http://www.mytotallyrealfitbiturl.com'
  fitbitSettings.cacheExpiryMilliseconds = 1000
  const getCache = sinon.stub()
  const setCache = sinon.stub()
  getCache.resolves(undefined)
  const fnGetFitbitToken = sinon.fake.resolves(undefined)

  const result = await makeFitbitRequest<FakeData>(
    inputUserId,
    inputUrl,
    inputAxios,
    fitbitSettings,
    getCache,
    setCache,
    fnGetFitbitToken
  )

  const expectedServiceCacheRequestUrl = fitbitSettings.rootApiUrl + inputUrl

  sinon.assert.calledOnceWithExactly(getCache, `${SERVICE_CACHE_KEY}:${inputUserId}:${expectedServiceCacheRequestUrl}`)

  expect(fnGetFitbitToken.calledOnce).toBeTruthy()
  expect(fnGetFitbitToken.calledOnceWith(inputUserId)).toBeTruthy()

  expect(inputAxios.get.notCalled).toBeTruthy()

  sinon.assert.notCalled(setCache)

  expect(result).toBeUndefined()
})

test('makeFitbitRequest :: error from fitbit, returns undefined', async () => {
  const inputUserId = 'testUserId-123'
  const inputUrl = '/our/fake/endpoint'
  const inputAxios = sinon.createStubInstance(Axios)
  const fitbitSettings = stubInterface<IFitbitSettings>()
  fitbitSettings.rootApiUrl = 'http://www.mytotallyrealfitbiturl.com'
  fitbitSettings.cacheExpiryMilliseconds = 1000
  const getCache = sinon.stub()
  const setCache = sinon.stub()
  getCache.resolves(undefined)
  const fakeAccessToken = 'acces-token-12345'
  const fnGetFitbitToken = sinon.fake.resolves({ access_token: fakeAccessToken })
  inputAxios.get.resolves({ status: 400, statusText: 'something', data: JSON.stringify({}) })

  const result = await makeFitbitRequest<FakeData>(
    inputUserId,
    inputUrl,
    inputAxios,
    fitbitSettings,
    getCache,
    setCache,
    fnGetFitbitToken
  )

  const expectedServiceCacheRequestUrl = fitbitSettings.rootApiUrl + inputUrl

  sinon.assert.calledOnceWithExactly(getCache, `${SERVICE_CACHE_KEY}:${inputUserId}:${expectedServiceCacheRequestUrl}`)

  expect(fnGetFitbitToken.calledOnce).toBeTruthy()
  expect(fnGetFitbitToken.calledOnceWith(inputUserId)).toBeTruthy()

  expect(inputAxios.get.calledOnce).toBeTruthy()
  expect(inputAxios.get.calledOnceWith(expectedServiceCacheRequestUrl, { headers: { authorization: `Bearer ${fakeAccessToken}` } })).toBeTruthy()

  sinon.assert.notCalled(setCache)

  expect(result).toBeUndefined()
})

describe('refreshToken', () => {
  it('happy path :: sends refresh requests for single token, and updates', async () => {
    const storedToken = {
      paceme_user_id: 'PacemeUserId',
      raw_token: { refresh_token: 'RefreshToken' }
    }

    const refreshedToken = {
      refresh_token: 'NewRefreshToken'
    }

    const inputExpiryOffsetMs = 3210

    const expectedDate = new Date(1930, 12, 12)

    const expectedAdjustedDate = new Date(1930, 12, 12)

    expectedAdjustedDate.setMilliseconds(expectedAdjustedDate.getMilliseconds() + inputExpiryOffsetMs)

    const fakeSettings = {
      clientId: 'SomeClientId',
      clientSecret: 'SomeClientSecret',
      tokenUrl: 'http://localhost/token'
    }

    const expectedQueryParameters = {
      client_id: fakeSettings.clientId,
      refresh_token: storedToken.raw_token.refresh_token,
      grant_type: 'refresh_token'
    }

    const expectedHeaders = {
      authorization: `Basic ${Buffer.from(`${fakeSettings.clientId}:${fakeSettings.clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }

    const expectedUrl = fakeSettings.tokenUrl

    const fakeTokenRepo = {
      getTokensThatExpireBefore: jest.fn().mockResolvedValue(ok([storedToken])),
      updateUserToken: jest.fn().mockResolvedValue(ok({}))
    }

    const fakeAxios = {
      post: jest.fn().mockResolvedValue({ status: 200, data: JSON.stringify(refreshedToken) })
    }
    const fakeNowGenerator = jest.fn().mockReturnValue(expectedDate)

    await refreshTokens(inputExpiryOffsetMs, fakeSettings as any, fakeTokenRepo as any, fakeAxios as any, fakeNowGenerator)
    expect(fakeTokenRepo.getTokensThatExpireBefore).toBeCalledTimes(1)
    expect(fakeTokenRepo.getTokensThatExpireBefore).toBeCalledWith(expectedAdjustedDate)
    expect(fakeAxios.post).toBeCalledTimes(1)
    expect(fakeAxios.post).toBeCalledWith(expectedUrl, '', { params: expectedQueryParameters, headers: expectedHeaders })
    expect(fakeTokenRepo.updateUserToken).toBeCalledTimes(1)
    expect(fakeTokenRepo.updateUserToken).toBeCalledWith(storedToken.paceme_user_id, refreshedToken)
  })
  it('happy path :: sends refresh requests for multiple tokens, and updates appropriately', async () => {
    const storedTokens = [{
      paceme_user_id: 'PacemeUserId',
      raw_token: { refresh_token: 'RefreshToken' }
    }, {
      paceme_user_id: 'PacemeUserId2',
      raw_token: { refresh_token: 'RefreshToken2' }
    }, {
      paceme_user_id: 'PacemeUserId3',
      raw_token: { refresh_token: 'RefreshToken3' }
    }]

    const inputExpiryOffsetMs = 3210

    const expectedDate = new Date(1930, 12, 12)

    const expectedAdjustedDate = new Date(1930, 12, 12)

    expectedAdjustedDate.setMilliseconds(expectedAdjustedDate.getMilliseconds() + inputExpiryOffsetMs)

    const fakeSettings = {
      clientId: 'SomeClientId',
      clientSecret: 'SomeClientSecret',
      tokenUrl: 'http://localhost/token'
    }

    const expectedQueryParameters = storedTokens.map(st => {
      return {
        client_id: fakeSettings.clientId,
        refresh_token: st.raw_token.refresh_token,
        grant_type: 'refresh_token'
      }
    })

    const expectedHeaders = {
      authorization: `Basic ${Buffer.from(`${fakeSettings.clientId}:${fakeSettings.clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }

    const expectedUrl = fakeSettings.tokenUrl

    const fakeTokenRepo = {
      getTokensThatExpireBefore: jest.fn().mockResolvedValue(ok(storedTokens)),
      updateUserToken: jest.fn().mockResolvedValue(ok({}))
    }

    const fakeAxios = {
      post: jest.fn().mockImplementation((url, body, opts) => { return { status: 200, data: JSON.stringify({ refresh_token: 'New' + opts.params.refresh_token }) } })
    }
    const fakeNowGenerator = jest.fn().mockReturnValue(expectedDate)

    await refreshTokens(inputExpiryOffsetMs, fakeSettings as any, fakeTokenRepo as any, fakeAxios as any, fakeNowGenerator)
    expect(fakeTokenRepo.getTokensThatExpireBefore).toBeCalledTimes(1)
    expect(fakeTokenRepo.getTokensThatExpireBefore).toBeCalledWith(expectedAdjustedDate)
    expect(fakeAxios.post).toBeCalledTimes(3)
    expectedQueryParameters.forEach(eqp => {
      expect(fakeAxios.post).toBeCalledWith(expectedUrl, '', { params: eqp, headers: expectedHeaders })
    })
    expect(fakeTokenRepo.updateUserToken).toBeCalledTimes(3)
    storedTokens.forEach(st => {
      expect(fakeTokenRepo.updateUserToken).toBeCalledWith(st.paceme_user_id, { refresh_token: 'New' + st.raw_token.refresh_token })
    })
  })
})
