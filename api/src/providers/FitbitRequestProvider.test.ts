import * as sinon from 'sinon'
import { stubInterface } from 'ts-sinon'
import { Request, Response } from 'express'
import {
  IFitbitSettings,
  makeFitbitRequest,
  startAuthenticationFlow
} from './FitbitRequestProvider'
import { CodeChallenceCache } from '../caches/codeChallengeCache'
import { Axios } from 'axios'
import { ServiceCache } from '../caches/serviceCache'

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
  const codeChallengeCache = sinon.createStubInstance(CodeChallenceCache)
  const fakeRandomString = 'TotallyARandomStringasdkmasd123'
  const fakeEncodedString = 'ajdksfnWEQO-IDJQWDksdjfanlikdj-n312094u123++++='
  const expectedFitbitCodeChallengeString = 'ajdksfnWEQO-IDJQWDksdjfanlikdj-n312094u123----'
  const fnRandomString = sinon.fake.returns(fakeRandomString)
  const fnCreatesha256String = sinon.fake.returns(fakeEncodedString)

  startAuthenticationFlow(
    testUserId,
    req,
    res,
    fitbitSettings,
    codeChallengeCache,
    fnRandomString,
    fnCreatesha256String
  )

  expect(codeChallengeCache.SetCode.calledOnceWithExactly(testUserId, fakeRandomString)).toBeTruthy()
  const send = res.send.getCall(0).firstArg
  expect(send.authUrl).toBeTruthy()
  const authUrlString: string = send.authUrl
  expect(authUrlString.startsWith(fitbitSettings.authUrl)).toBeTruthy()
  expect(authUrlString).toContain(expectedRawScopeParam)
  const authUrl = new URL(authUrlString)
  expect(authUrl.searchParams.get('client_id')).toBe(fitbitSettings.clientId)
  expect(authUrl.searchParams.get('response_type')).toBe('code')
  expect(authUrl.searchParams.get('code_challenge')).toBe(expectedFitbitCodeChallengeString)
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
  const serviceCache = sinon.createStubInstance(ServiceCache)
  const unserialisedValue = { somefield: 'blahblahblah' }
  const returnedCacheValue = { serialisedResponse: JSON.stringify(unserialisedValue), date: new Date() }
  serviceCache.GetResponse.resolves(returnedCacheValue)
  const fnGetFitbitToken = sinon.fake.resolves({})

  const result = await makeFitbitRequest<FakeData>(
    inputUserId,
    inputUrl,
    inputAxios,
    fitbitSettings,
    serviceCache,
    fnGetFitbitToken
  )

  const expectedServiceCacheRequestUrl = fitbitSettings.rootApiUrl + inputUrl

  expect(serviceCache.GetResponse.calledOnce).toBeTruthy()
  expect(serviceCache.GetResponse.calledOnceWith(inputUserId, expectedServiceCacheRequestUrl)).toBeTruthy()

  expect(fnGetFitbitToken.notCalled).toBeTruthy()
  expect(inputAxios.get.notCalled).toBeTruthy()
  expect(serviceCache.SaveResponse.notCalled).toBeTruthy()
  expect(result).toMatchObject(unserialisedValue)
})

test('makeFitbitRequest :: no cached value, asks fitbit for value', async () => {
  const inputUserId = 'testUserId-123'
  const inputUrl = '/our/fake/endpoint'
  const inputAxios = sinon.createStubInstance(Axios)
  const fitbitSettings = stubInterface<IFitbitSettings>()
  fitbitSettings.rootApiUrl = 'http://www.mytotallyrealfitbiturl.com'
  fitbitSettings.cacheExpiryMilliseconds = 0
  const serviceCache = sinon.createStubInstance(ServiceCache)
  const unserialisedValue = { somefield: 'blahblahblah' }
  serviceCache.GetResponse.resolves(undefined)
  const fakeAccessToken = 'acces-token-12345'
  const fnGetFitbitToken = sinon.fake.resolves({ access_token: fakeAccessToken })
  inputAxios.get.resolves({ status: 200, data: JSON.stringify(unserialisedValue) })

  const result = await makeFitbitRequest<FakeData>(
    inputUserId,
    inputUrl,
    inputAxios,
    fitbitSettings,
    serviceCache,
    fnGetFitbitToken
  )

  const expectedServiceCacheRequestUrl = fitbitSettings.rootApiUrl + inputUrl

  expect(serviceCache.GetResponse.calledOnce).toBeTruthy()
  expect(serviceCache.GetResponse.calledOnceWith(inputUserId, expectedServiceCacheRequestUrl)).toBeTruthy()

  expect(fnGetFitbitToken.calledOnce).toBeTruthy()
  expect(fnGetFitbitToken.calledOnceWith(inputUserId)).toBeTruthy()

  expect(inputAxios.get.calledOnce).toBeTruthy()
  expect(inputAxios.get.calledOnceWith(expectedServiceCacheRequestUrl, { headers: { authorization: `Bearer ${fakeAccessToken}` } })).toBeTruthy()

  expect(serviceCache.SaveResponse.calledOnce).toBeTruthy()
  expect(serviceCache.SaveResponse.calledOnceWith(inputUserId, expectedServiceCacheRequestUrl, JSON.stringify(unserialisedValue))).toBeTruthy()

  expect(result).toMatchObject(unserialisedValue)
})

test('makeFitbitRequest :: outdated cached value, asks fitbit for value', async () => {
  const inputUserId = 'testUserId-123'
  const inputUrl = '/our/fake/endpoint'
  const inputAxios = sinon.createStubInstance(Axios)
  const fitbitSettings = stubInterface<IFitbitSettings>()
  fitbitSettings.rootApiUrl = 'http://www.mytotallyrealfitbiturl.com'
  fitbitSettings.cacheExpiryMilliseconds = 1000
  const serviceCache = sinon.createStubInstance(ServiceCache)
  const unserialisedValue = { somefield: 'blahblahblah' }
  const returnedCacheValue = { serialisedResponse: JSON.stringify(unserialisedValue), date: new Date(1920, 12, 12) }
  serviceCache.GetResponse.resolves(returnedCacheValue)
  const fakeAccessToken = 'acces-token-12345'
  const fnGetFitbitToken = sinon.fake.resolves({ access_token: fakeAccessToken })
  inputAxios.get.resolves({ status: 200, data: JSON.stringify(unserialisedValue) })

  const result = await makeFitbitRequest<FakeData>(
    inputUserId,
    inputUrl,
    inputAxios,
    fitbitSettings,
    serviceCache,
    fnGetFitbitToken
  )

  const expectedServiceCacheRequestUrl = fitbitSettings.rootApiUrl + inputUrl

  expect(serviceCache.GetResponse.calledOnce).toBeTruthy()
  expect(serviceCache.GetResponse.calledOnceWith(inputUserId, expectedServiceCacheRequestUrl)).toBeTruthy()

  expect(fnGetFitbitToken.calledOnce).toBeTruthy()
  expect(fnGetFitbitToken.calledOnceWith(inputUserId)).toBeTruthy()

  expect(inputAxios.get.calledOnce).toBeTruthy()
  expect(inputAxios.get.calledOnceWith(expectedServiceCacheRequestUrl, { headers: { authorization: `Bearer ${fakeAccessToken}` } })).toBeTruthy()

  expect(serviceCache.SaveResponse.calledOnce).toBeTruthy()
  expect(serviceCache.SaveResponse.calledOnceWith(inputUserId, expectedServiceCacheRequestUrl, JSON.stringify(unserialisedValue))).toBeTruthy()

  expect(result).toMatchObject(unserialisedValue)
})

test('makeFitbitRequest :: outdated cached value, asks fitbit for value', async () => {
  const inputUserId = 'testUserId-123'
  const inputUrl = '/our/fake/endpoint'
  const inputAxios = sinon.createStubInstance(Axios)
  const fitbitSettings = stubInterface<IFitbitSettings>()
  fitbitSettings.rootApiUrl = 'http://www.mytotallyrealfitbiturl.com'
  fitbitSettings.cacheExpiryMilliseconds = 1000
  const serviceCache = sinon.createStubInstance(ServiceCache)
  const unserialisedValue = { somefield: 'blahblahblah' }
  const returnedCacheValue = { serialisedResponse: JSON.stringify(unserialisedValue), date: new Date(1920, 12, 12) }
  serviceCache.GetResponse.resolves(returnedCacheValue)
  const fakeAccessToken = 'acces-token-12345'
  const fnGetFitbitToken = sinon.fake.resolves({ access_token: fakeAccessToken })
  inputAxios.get.resolves({ status: 200, data: JSON.stringify(unserialisedValue) })

  const result = await makeFitbitRequest<FakeData>(
    inputUserId,
    inputUrl,
    inputAxios,
    fitbitSettings,
    serviceCache,
    fnGetFitbitToken
  )

  const expectedServiceCacheRequestUrl = fitbitSettings.rootApiUrl + inputUrl

  expect(serviceCache.GetResponse.calledOnce).toBeTruthy()
  expect(serviceCache.GetResponse.calledOnceWith(inputUserId, expectedServiceCacheRequestUrl)).toBeTruthy()

  expect(fnGetFitbitToken.calledOnce).toBeTruthy()
  expect(fnGetFitbitToken.calledOnceWith(inputUserId)).toBeTruthy()

  expect(inputAxios.get.calledOnce).toBeTruthy()
  expect(inputAxios.get.calledOnceWith(expectedServiceCacheRequestUrl, { headers: { authorization: `Bearer ${fakeAccessToken}` } })).toBeTruthy()

  expect(serviceCache.SaveResponse.calledOnce).toBeTruthy()
  expect(serviceCache.SaveResponse.calledOnceWith(inputUserId, expectedServiceCacheRequestUrl, JSON.stringify(unserialisedValue))).toBeTruthy()

  expect(result).toMatchObject(unserialisedValue)
})

test('makeFitbitRequest :: no cached value, no token, returns undefined', async () => {
  const inputUserId = 'testUserId-123'
  const inputUrl = '/our/fake/endpoint'
  const inputAxios = sinon.createStubInstance(Axios)
  const fitbitSettings = stubInterface<IFitbitSettings>()
  fitbitSettings.rootApiUrl = 'http://www.mytotallyrealfitbiturl.com'
  fitbitSettings.cacheExpiryMilliseconds = 1000
  const serviceCache = sinon.createStubInstance(ServiceCache)
  serviceCache.GetResponse.resolves(undefined)
  const fnGetFitbitToken = sinon.fake.resolves(undefined)

  const result = await makeFitbitRequest<FakeData>(
    inputUserId,
    inputUrl,
    inputAxios,
    fitbitSettings,
    serviceCache,
    fnGetFitbitToken
  )

  const expectedServiceCacheRequestUrl = fitbitSettings.rootApiUrl + inputUrl

  expect(serviceCache.GetResponse.calledOnce).toBeTruthy()
  expect(serviceCache.GetResponse.calledOnceWith(inputUserId, expectedServiceCacheRequestUrl)).toBeTruthy()

  expect(fnGetFitbitToken.calledOnce).toBeTruthy()
  expect(fnGetFitbitToken.calledOnceWith(inputUserId)).toBeTruthy()

  expect(inputAxios.get.notCalled).toBeTruthy()

  expect(serviceCache.SaveResponse.notCalled).toBeTruthy()

  expect(result).toBeUndefined()
})

test('makeFitbitRequest :: error from fitbit, returns undefined', async () => {
  const inputUserId = 'testUserId-123'
  const inputUrl = '/our/fake/endpoint'
  const inputAxios = sinon.createStubInstance(Axios)
  const fitbitSettings = stubInterface<IFitbitSettings>()
  fitbitSettings.rootApiUrl = 'http://www.mytotallyrealfitbiturl.com'
  fitbitSettings.cacheExpiryMilliseconds = 1000
  const serviceCache = sinon.createStubInstance(ServiceCache)
  serviceCache.GetResponse.resolves(undefined)
  const fakeAccessToken = 'acces-token-12345'
  const fnGetFitbitToken = sinon.fake.resolves({ access_token: fakeAccessToken })
  inputAxios.get.resolves({ status: 400, statusText: 'something', data: JSON.stringify({}) })

  const result = await makeFitbitRequest<FakeData>(
    inputUserId,
    inputUrl,
    inputAxios,
    fitbitSettings,
    serviceCache,
    fnGetFitbitToken
  )

  const expectedServiceCacheRequestUrl = fitbitSettings.rootApiUrl + inputUrl

  expect(serviceCache.GetResponse.calledOnce).toBeTruthy()
  expect(serviceCache.GetResponse.calledOnceWith(inputUserId, expectedServiceCacheRequestUrl)).toBeTruthy()

  expect(fnGetFitbitToken.calledOnce).toBeTruthy()
  expect(fnGetFitbitToken.calledOnceWith(inputUserId)).toBeTruthy()

  expect(inputAxios.get.calledOnce).toBeTruthy()
  expect(inputAxios.get.calledOnceWith(expectedServiceCacheRequestUrl, { headers: { authorization: `Bearer ${fakeAccessToken}` } })).toBeTruthy()

  expect(serviceCache.SaveResponse.notCalled).toBeTruthy()

  expect(result).toBeUndefined()
})
