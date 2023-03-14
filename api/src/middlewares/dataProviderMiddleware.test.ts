import { dataProviderMiddleware } from './dataProviderMiddleware'

describe('dataProviderMiddleware', () => {
  test("No fitbit configured :: doesn't check token", async () => {
    const mockRepository = {
      getSetting: jest.fn().mockResolvedValue({ caloriesIn: 'openfooddiary' })
    }
    const mockTokenRetreiver = {
      fitbit: jest.fn()
    }

    const mockNext = jest.fn()

    await dataProviderMiddleware({} as any,
        { locals: { userId: 'jimmy-blogs' } } as any,
        mockNext,
        mockRepository as any,
        mockTokenRetreiver as any)

    expect(mockRepository.getSetting).toBeCalledWith('jimmy-blogs', 'provider_settings')
    expect(mockTokenRetreiver.fitbit).not.toBeCalled()
    expect(mockNext).toBeCalled()
  })
  test('Fitbit configured :: checks token :: happy', async () => {
    const mockRepository = {
      getSetting: jest.fn().mockResolvedValue({ caloriesIn: 'fitbit' })
    }
    const mockTokenRetreiver = {
      fitbit: jest.fn().mockResolvedValue({ whoami: 'token' })
    }

    const mockNext = jest.fn()

    await dataProviderMiddleware({} as any,
        { locals: { userId: 'jimmy-blogs' } } as any,
        mockNext,
        mockRepository as any,
        mockTokenRetreiver as any)

    expect(mockRepository.getSetting).toBeCalledWith('jimmy-blogs', 'provider_settings')
    expect(mockTokenRetreiver.fitbit).toBeCalledWith('jimmy-blogs')
    expect(mockNext).toBeCalled()
  })
  test('Fitbit configured :: checks token :: unhappy', async () => {
    const mockRepository = {
      getSetting: jest.fn().mockResolvedValue({ caloriesIn: 'fitbit' })
    }
    const mockTokenRetreiver = {
      fitbit: jest.fn().mockResolvedValue(undefined)
    }

    const mockNext = jest.fn()

    const mockRes = {
      locals: { userId: 'jimmy-blogs' },
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    }

    await dataProviderMiddleware({} as any,
        mockRes as any,
        mockNext,
        mockRepository as any,
        mockTokenRetreiver as any)

    expect(mockRepository.getSetting).toBeCalledWith('jimmy-blogs', 'provider_settings')
    expect(mockTokenRetreiver.fitbit).toBeCalledWith('jimmy-blogs')
    expect(mockRes.status).toBeCalledWith(400)
    expect(mockNext).not.toBeCalled()
  })
})
