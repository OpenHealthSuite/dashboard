import { pacemeUserRouteGetRequest, pacemeGetRequest } from "./PaceMeApiService";

describe("pacemeUserRouteGetRequest", () => {
  test("Gets user details and prepends to request path", async () => {
    const authDetails = { userId: "fakeUserId" };
    const fakeAuthDetails = jest.fn().mockResolvedValue(authDetails);
    const response = { whoami: "ReturnedSettings" };
    const fakeFetch = jest.fn().mockResolvedValue(response);
    const fakeRequestRoute = "/fakeRequestRoute";

    const result = await pacemeUserRouteGetRequest(
      fakeRequestRoute,
      fakeAuthDetails,
      fakeFetch
    );

    expect(result).toBe(response);
    expect(fakeFetch).toBeCalledWith(
       "/users/" + authDetails.userId + fakeRequestRoute
    );
  });
})

describe("pacemeGetRequest", () => {
  test("Happy path :: uses URL, rereives data", async () => {
    const response = { whoami: "ReturnedSettings" };
    const fakeFetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue(response),
    });
    const fakeRequestRoute = "/fakeRequestRoute";
    const fakeApiRoot = "http://localhost:9090";

    const result = await pacemeGetRequest(
      fakeRequestRoute,
      fakeFetch,
      fakeApiRoot
    );

    expect(result).toBe(response);
    expect(fakeFetch).toBeCalledWith(
      fakeApiRoot + fakeRequestRoute
    );
  });
  test("Non 200 status :: throws error", async () => {
    const response = { whoami: "ReturnedSettings" };
    const fakeFetch = jest.fn().mockResolvedValue({
      status: 403,
      json: jest.fn().mockResolvedValue(response),
    });
    const fakeRequestRoute = "/fakeRequestRoute";
    const fakeApiRoot = "http://localhost:9090";

    await expect(pacemeGetRequest(
      fakeRequestRoute,
      fakeFetch,
      fakeApiRoot
    )).rejects.not.toBeUndefined()
    expect(fakeFetch).toBeCalledTimes(1);
    expect(fakeFetch).toBeCalledWith(
      fakeApiRoot + fakeRequestRoute
    );
  });
})