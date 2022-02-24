import { userRestrictedHandler } from './UserRestrictedHandler'
import { Request, Response } from 'express'
import { stubInterface } from 'ts-sinon'
import * as sinon from 'sinon'

describe('User Restricted Handler', () => {
  const validRequests = [
    ['userId123', 'userId123']
  ]

  test.each(validRequests)('Valid Requests', async (localUserId, parameterUserId) => {
    const fakeRequest = stubInterface<Request>()
    const fakeResponse = stubInterface<Response>()
    fakeResponse.locals.userId = localUserId
    fakeRequest.params.userId = parameterUserId
    const next = sinon.stub()
    await userRestrictedHandler(fakeRequest, fakeResponse, next)
    sinon.assert.calledOnceWithExactly(next, parameterUserId, fakeRequest, fakeResponse)
    expect(fakeResponse.sendStatus.notCalled).toBe(true)
  })

  const invalidRequests = [
    ['userId123', 'UserId321'],
    [undefined, 'UserId321'],
    ['userId123', undefined],
    [undefined, undefined]
  ]

  test.each(invalidRequests)('Invalid Requests', async (localUserId, parameterUserId) => {
    const fakeRequest = stubInterface<Request>()
    const fakeResponse = stubInterface<Response>()
    fakeResponse.locals.userId = localUserId
    fakeRequest.params.userId = parameterUserId as string
    const next = sinon.stub()
    await userRestrictedHandler(fakeRequest, fakeResponse, next)
    sinon.assert.notCalled(next)
    expect(fakeResponse.sendStatus.calledOnceWithExactly(403)).toBe(true)
  })
})
