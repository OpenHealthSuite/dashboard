import { availableProviders } from './userSettingHandlers'

jest.mock('../providers', () => ({
  provOne: {
    fnOne: jest.fn(),
    fnTwo: jest.fn(),
    fnThree: jest.fn()
  },
  provTwo: {
    fnTwo: jest.fn()
  }
}))

test('availableProviders', () => {
  const res = {
    send: jest.fn()
  }
  availableProviders({} as any, res as any)
  expect(res.send).toBeCalledWith({ fnOne: ['provOne'], fnTwo: ['provOne', 'provTwo'], fnThree: ['provOne'] })
})
