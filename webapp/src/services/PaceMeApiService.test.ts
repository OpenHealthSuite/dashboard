import { pacemeUserRouteGetRequest, pacemeGetRequest, pacemePostRequest, pacemeUserRoutePostRequest } from "./PaceMeApiService";

describe("pacemeUserRouteGetRequest", () => {
  test("Gets user details and prepends to request path", async () => {
    const authDetails = { userId: "fakeUserId" };
    const fakeAuthDetails = jest.fn().mockResolvedValue(authDetails);
    const response = { whoami: "ReturnedSettings" };
    const fakePacemeGetRequest = jest.fn().mockResolvedValue(response);
    const fakeRequestRoute = "/fakeRequestRoute";

    const result = await pacemeUserRouteGetRequest(
      fakeRequestRoute,
      fakeAuthDetails,
      fakePacemeGetRequest
    );

    expect(result).toBe(response);
    expect(fakePacemeGetRequest).toBeCalledWith(
       "/users/" + authDetails.userId + fakeRequestRoute
    );
  });
})

describe("pacemeUserRoutePostRequest", () => {
  test("Gets user details and prepends to request path", async () => {
    const authDetails = { userId: "fakeUserId" };
    const fakeAuthDetails = jest.fn().mockResolvedValue(authDetails);
    const response = { whoami: "ReturnedSettings" };
    const fakePacemePostRequest = jest.fn().mockResolvedValue(response);
    const fakeRequestRoute = "/fakeRequestRoute";
    const fakeRequestBody = { whoami: "FakeRequestBody"}

    const result = await pacemeUserRoutePostRequest(
      fakeRequestRoute,
      fakeRequestBody,
      fakeAuthDetails,
      fakePacemePostRequest
    );

    expect(result).toBe(response);
    expect(fakePacemePostRequest).toBeCalledWith(
       "/users/" + authDetails.userId + fakeRequestRoute,
       fakeRequestBody
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

describe("pacemePostRequest", () => {
  test("Happy path :: uses URL, uses body, rereives data", async () => {
    const response = { whoami: "ReturnedSettings" };
    const fakeRequestBody = { whoami: "FakeRequestBody"}
    const fakeFetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue(response),
    });
    const fakeRequestRoute = "/fakeRequestRoute";
    const fakeApiRoot = "http://localhost:9090";

    const result = await pacemePostRequest(
      fakeRequestRoute,
      fakeRequestBody,
      fakeFetch,
      fakeApiRoot
    );

    expect(result).toBe(response);
    expect(fakeFetch).toBeCalledWith(
      fakeApiRoot + fakeRequestRoute,
      {
        method: "POST",
        body: JSON.stringify(fakeRequestBody)
      }
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
    const fakeRequestBody = { whoami: "FakeRequestBody"}

    await expect(pacemePostRequest(
      fakeRequestRoute,
      fakeRequestBody,
      fakeFetch,
      fakeApiRoot
    )).rejects.not.toBeUndefined()
    expect(fakeFetch).toBeCalledTimes(1);
    expect(fakeFetch).toBeCalledWith(
      fakeApiRoot + fakeRequestRoute,
      {
        method: "POST",
        body: JSON.stringify(fakeRequestBody)
      }
    );
  });
})