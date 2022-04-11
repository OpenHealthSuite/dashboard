import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import {
  ActivityDashboard,
  getDashboardSettings,
} from "./ActivityDashboard_v2";

describe("ActivityDashboard", () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
  });

  test("Loading Renders", async () => {
    const fakeDashSettings = jest.fn();
    fakeDashSettings.mockRejectedValue({});
    await act(async () => {
      render(<ActivityDashboard fnGetSettings={fakeDashSettings} />, container);
      expect(container.textContent).toBe("Loading");
    });
  });
  test("Error Renders", async () => {
    const fakeDashSettings = jest.fn();
    fakeDashSettings.mockRejectedValue({});
    await act(async () => {
      render(<ActivityDashboard fnGetSettings={fakeDashSettings} />, container);
    });
    expect(container.textContent).toBe("Error");
  });
  test("Temp :: Component List Renders", async () => {
    const fakeDashSettings = jest.fn();
    const componentNames = [
      "SomeComponentName",
      "SomeOtherComponentName",
      "LastComponentName",
    ];
    fakeDashSettings.mockResolvedValue({
      tileSettings: componentNames.map((componentName) => {
        return { componentName };
      }),
    });
    await act(async () => {
      render(<ActivityDashboard fnGetSettings={fakeDashSettings} />, container);
    });
    componentNames.forEach((componentName) => {
      expect(container).toHaveTextContent(componentName);
    });
  });
});

describe("ActivityDashboard functions", () => {
  describe("getSettings", () => {
    test("Happy path :: gets and returns settings", async () => {
      const authDetails = { userId: "fakeUserId" };
      const fakeAuthDetails = jest.fn().mockResolvedValue(authDetails);
      const response = { whoami: "ReturnedSettings" };
      const fakeFetch = jest.fn().mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue(response),
      });
      const fakeApiRoot = "/fakeApiRoot";

      const result = await getDashboardSettings(
        fakeAuthDetails,
        fakeFetch,
        fakeApiRoot,
        {} as any
      );

      expect(result).toBe(response);
      expect(fakeFetch).toBeCalledWith(
        fakeApiRoot + "/users/" + authDetails.userId + "/userSettings/dashboard"
      );
    });
    test("Non 200 status :: returns defaults", async () => {
      const authDetails = { userId: "fakeUserId" };
      const fakeAuthDetails = jest.fn().mockResolvedValue(authDetails);
      const response = { whoami: "ReturnedSettings" };
      const fakeFetch = jest.fn().mockResolvedValue({
        status: 403,
        json: jest.fn().mockResolvedValue(response),
      });
      const fakeApiRoot = "/fakeApiRoot";
      const defaults = { whoami: "DefaultSettings" };

      const result = await getDashboardSettings(
        fakeAuthDetails,
        fakeFetch,
        fakeApiRoot,
        defaults as any
      );

      expect(result).toBe(defaults);
      expect(fakeFetch).toBeCalledTimes(1);
      expect(fakeFetch).toBeCalledWith(
        fakeApiRoot + "/users/" + authDetails.userId + "/userSettings/dashboard"
      );
    });
    test("Error on auth :: returns defaults", async () => {
      const authDetails = { userId: "fakeUserId" };
      const fakeAuthDetails = jest.fn().mockRejectedValue(authDetails);
      const fakeFetch = jest.fn();
      const fakeApiRoot = "/fakeApiRoot";
      const defaults = { whoami: "DefaultSettings" };

      const result = await getDashboardSettings(
        fakeAuthDetails,
        fakeFetch,
        fakeApiRoot,
        defaults as any
      );

      expect(result).toBe(defaults);
      expect(fakeFetch).toBeCalledTimes(0);
    });
    test("Error on user :: returns defaults", async () => {
      const authDetails = { userId: "fakeUserId" };
      const fakeAuthDetails = jest.fn().mockResolvedValue(authDetails);
      const fakeFetch = jest.fn().mockRejectedValue({});
      const fakeApiRoot = "/fakeApiRoot";
      const defaults = { whoami: "DefaultSettings" };

      const result = await getDashboardSettings(
        fakeAuthDetails,
        fakeFetch,
        fakeApiRoot,
        defaults as any
      );

      expect(result).toBe(defaults);
      expect(fakeFetch).toBeCalledTimes(1);
    });
  });
});
