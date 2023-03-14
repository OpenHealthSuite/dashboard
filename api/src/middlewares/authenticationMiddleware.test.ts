import { authenticationMiddleware } from './authenticationMiddleware'
import { Request } from 'express'

describe('authenticationMiddleware', () => {
  test('Happy Path :: Current Setup', async () => {
    const token = 'adkmasdia'
    const fakeReq = {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`
      },
      header: jest.fn().mockReturnValue('SomeUserId')
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

    await authenticationMiddleware(
      fakeReq as unknown as Request,
      fakeRes as unknown as any,
      fakeNextFunction
    )

    expect(fakeNextFunction).toBeCalledTimes(1)
  })
})
