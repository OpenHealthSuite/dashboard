import { getAuthDetails } from './AuthenticationDetails'

describe("AuthenticationDetails function", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });
  test.each(['val2', 'something', 'hello'])('Dev environment variable defined :: returns defined value', async (devVal) => {
    const fakeFetch = jest.fn()
    process.env.REACT_APP_DEV_USER_ID = devVal
    const result = await getAuthDetails(fakeFetch, devVal)
    expect(fakeFetch).not.toBeCalled()
    expect(result.userId).toBe(devVal)
  })
  test.each(["something", "userelse", "userID"])('Non dev environment :: fetches from remote', async (userValue) => {
    const fakeJson = jest.fn().mockResolvedValue({ user: userValue })
    const fakeFetch = jest.fn().mockResolvedValue({ json: fakeJson })
    process.env.REACT_APP_DEV_USER_ID = undefined
    const result = await getAuthDetails(fakeFetch)
    expect(fakeFetch).toBeCalledTimes(1)
    expect(fakeFetch).toBeCalledWith('/oauth2/userinfo')
    expect(result.userId).toBe(userValue)
  })
})