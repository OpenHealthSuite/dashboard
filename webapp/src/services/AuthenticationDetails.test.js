import { getAuthDetails } from './AuthenticationDetails'

describe("AuthenticationDetails function", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });
  test.each(["something", "userelse", "userID"])('Calls /whoami for user details', async (userValue) => {
    const fakePacemeGet = vi.fn().mockResolvedValue({ userId: userValue })
    process.env.REACT_APP_DEV_USER_ID = undefined
    const result = await getAuthDetails(fakePacemeGet)
    expect(fakePacemeGet).toBeCalledTimes(1)
    expect(fakePacemeGet).toBeCalledWith('/whoami')
    expect(result.userId).toBe(userValue)
  })
})