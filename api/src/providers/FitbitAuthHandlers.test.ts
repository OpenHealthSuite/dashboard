import * as sinon from 'sinon'
import { stubInterface } from 'ts-sinon'
import { Request, Response } from 'express'
import {
  IFitbitSettings,
  startAuthenticationFlow
} from './FitbitAuthHandlers'
import { CodeChallenceCache } from '../caches/codeChallengeCache'

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
