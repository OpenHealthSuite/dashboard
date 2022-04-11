import { render, screen } from "@testing-library/react";
import { DEFAULT_DASHBOARD_SETTINGS } from "../../services/SettingsService";
import {
  ActivityDashboard,
  getDashboardSettings,
} from "./ActivityDashboard_v2";

describe("ActivityDashboard", () => {
  test("renders", () => {
    render(<ActivityDashboard />);
    const helloElement = screen.getByText(/Hello/i);
    expect(helloElement).toBeInTheDocument();
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

      const result = await getDashboardSettings({
        fnGetAuthDetails: fakeAuthDetails,
        fnFetch: fakeFetch,
        apiRoot: fakeApiRoot,
        defaults: {},
      });

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

      const result = await getDashboardSettings({
        fnGetAuthDetails: fakeAuthDetails,
        fnFetch: fakeFetch,
        apiRoot: fakeApiRoot,
        defaults: defaults,
      });

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

      const result = await getDashboardSettings({
        fnGetAuthDetails: fakeAuthDetails,
        fnFetch: fakeFetch,
        apiRoot: fakeApiRoot,
        defaults: defaults,
      });

      expect(result).toBe(defaults);
      expect(fakeFetch).toBeCalledTimes(0);
    });
    test("Error on user :: returns defaults", async () => {
      const authDetails = { userId: "fakeUserId" };
      const fakeAuthDetails = jest.fn().mockResolvedValue(authDetails);
      const fakeFetch = jest.fn().mockRejectedValue({});
      const fakeApiRoot = "/fakeApiRoot";
      const defaults = { whoami: "DefaultSettings" };

      const result = await getDashboardSettings({
        fnGetAuthDetails: fakeAuthDetails,
        fnFetch: fakeFetch,
        apiRoot: fakeApiRoot,
        defaults: defaults,
      });

      expect(result).toBe(defaults);
      expect(fakeFetch).toBeCalledTimes(1);
    });
  });
});
