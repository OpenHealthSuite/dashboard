import { ok } from 'neverthrow'
import { dataProviderMiddleware } from './dataProviderMiddleware'

describe('dataProviderMiddleware', () => {
  test("No fitbit configured :: doesn't check token", async () => {
    const mockRepository = {
      getSetting: jest.fn().mockResolvedValue(ok({ details: { caloriesIn: 'openfooddiary' } }))
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
      getSetting: jest.fn().mockResolvedValue(ok({ details: { caloriesIn: 'fitbit' } }))
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
      getSetting: jest.fn().mockResolvedValue(ok({ details: { caloriesIn: 'fitbit' } }))
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
  test('Uses user configuration to pull various functions', async () => {
    const mockUserSettings = {
      caloriesIn: 'prov1',
      caloriesOut: 'some_provider',
      stepsMade: 'something'
    }
    const mockRepository = {
      getSetting: jest.fn().mockResolvedValue(ok({ details: mockUserSettings }))
    }

    const mockProviders = {
      prov1: {
        caloriesIn: { whoami: 'prov1CalIn' }
      },
      some_provider: {
        caloriesOut: { whoami: 'som_prov_calOut' }
      }
    }

    const mockNext = jest.fn()

    const res: any = { locals: { userId: 'jimmy-blogs' } }

    await dataProviderMiddleware({} as any,
      res,
      mockNext,
      mockRepository as any,
      {} as any,
      mockProviders as any)

    expect(mockNext).toBeCalled()
    expect(res.locals.dataProvider).toEqual({
      caloriesIn: mockProviders.prov1.caloriesIn,
      caloriesOut: mockProviders.some_provider.caloriesOut
    })
  })
})
