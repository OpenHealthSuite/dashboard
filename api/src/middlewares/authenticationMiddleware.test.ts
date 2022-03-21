import { authenticationMiddleware } from './authenticationMiddleware'
import { Request, Response } from 'express'

describe('authenticationMiddleware', () => {
  test('Happy Path :: Current Setup', async () => {
    const token = 'adkmasdia'
    const fakeReq = {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`
      }
    }

    const fakeRes = {
      setHeader: jest.fn(),
      locals: {
        userId: ''
      },
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    }

    const fakeNextFunction = jest.fn()

    const fakeCognitoExpress = {
      validate: jest.fn().mockResolvedValue({ sub: 'subresponse' })
    }
    await authenticationMiddleware(
      fakeReq as unknown as Request,
      fakeRes as unknown as Response,
      fakeNextFunction,
      fakeCognitoExpress
    )

    expect(fakeNextFunction).toBeCalledTimes(1)
  })
})
