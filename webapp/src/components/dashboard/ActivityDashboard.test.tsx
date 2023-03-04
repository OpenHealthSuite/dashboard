import {
  waitFor,
  screen,
  render,
} from "@testing-library/react";
import { ActivityDashboard, getDashboardSettings } from "./ActivityDashboard";
import { IAvailableTiles } from "./tiles";

describe("ActivityDashboard", () => {
  test("Loading Renders", async () => {
    const fakeDashSettings = vi.fn();
    fakeDashSettings.mockRejectedValue({});
    render(
      <ActivityDashboard fnGetSettings={fakeDashSettings} availableTiles={{}} />
    );
    expect((await screen.findAllByText("Loading")).length).toBe(1);
  });
  test("Error Renders", async () => {
    const fakeDashSettings = vi.fn();
    fakeDashSettings.mockRejectedValue({});
    render(
      <ActivityDashboard fnGetSettings={fakeDashSettings} availableTiles={{}} />
    );
    await waitFor(() => expect(fakeDashSettings).toHaveBeenCalledTimes(1));
    expect((await screen.findAllByText("Error")).length).toBe(1);
  });

  test("Renders All Tiles", async () => {
    const fakeDashSettings = vi.fn();
    const componentNames = [
      "SomeComponentName",
      "SomeOtherComponentName",
      "LastComponentName",
    ];
    fakeDashSettings.mockResolvedValue({
      spacing: 2,
      tileSettings: componentNames.map((componentName) => {
        return { componentName: componentName };
      }),
      tileSizes: {
        xs: 5,
        sm: 10,
        md: 12,
      },
    });

    const fakeAvailableTiles: IAvailableTiles = {};
    for (const key in componentNames) {
      fakeAvailableTiles[componentNames[key]] = {
        displayName: key + "DisplayName",
        component: () => <>{componentNames[key]} Component Content</>,
      };
    }
    render(
      <ActivityDashboard
        fnGetSettings={fakeDashSettings}
        availableTiles={fakeAvailableTiles}
      />
    );
    await waitFor(() => expect(fakeDashSettings).toHaveBeenCalledTimes(1));
    componentNames.forEach(async (componentName) => {
      const component = await screen.findByText(componentName);
      expect(component).toHaveTextContent(componentName + " Component Content");
    });
  });

  test("Renders Only Available Tiles", async () => {
    const fakeDashSettings = vi.fn();
    const componentNames = [
      "SomeComponentName",
      "SomeOtherComponentName",
      "LastComponentName",
    ];
    const availableComponentNames = ["SomeComponentName", "LastComponentName"];
    fakeDashSettings.mockResolvedValue({
      spacing: 2,
      tileSettings: componentNames.map((componentName) => {
        return { componentName: componentName };
      }),
      tileSizes: {
        xs: 5,
        sm: 10,
        md: 12,
      },
    });

    const fakeAvailableTiles: IAvailableTiles = {};
    for (const key in availableComponentNames) {
      fakeAvailableTiles[availableComponentNames[key]] = {
        displayName: key + "DisplayName",
        component: () => <>{availableComponentNames[key]} Component Content</>,
      };
    }
    render(
      <ActivityDashboard
        fnGetSettings={fakeDashSettings}
        availableTiles={fakeAvailableTiles}
      />
    );
    await waitFor(() => expect(fakeDashSettings).toHaveBeenCalledTimes(1));
    availableComponentNames.forEach(async (componentName) => {
      const component = await screen.findByText(componentName);
      expect(component).toHaveTextContent(componentName + " Component Content");
    });
    expect(screen.queryByText("SomeOtherComponentName Component Content")).toBe(
      null
    );
  });
  test("Renders Only Settings Tiles", async () => {
    const fakeDashSettings = vi.fn();
    const componentNames = ["SomeComponentName", "LastComponentName"];
    const availableComponentNames = [
      "SomeComponentName",
      "SomeOtherComponentName",
      "LastComponentName",
    ];
    fakeDashSettings.mockResolvedValue({
      spacing: 2,
      tileSettings: componentNames.map((componentName) => {
        return { componentName: componentName };
      }),
      tileSizes: {
        xs: 5,
        sm: 10,
        md: 12,
      },
    });

    const fakeAvailableTiles: IAvailableTiles = {};
    for (const key in availableComponentNames) {
      fakeAvailableTiles[availableComponentNames[key]] = {
        displayName: key + "DisplayName",
        component: () => <>{availableComponentNames[key]} Component Content</>,
      };
    }
    render(
      <ActivityDashboard
        fnGetSettings={fakeDashSettings}
        availableTiles={fakeAvailableTiles}
      />
    );
    await waitFor(() => expect(fakeDashSettings).toHaveBeenCalledTimes(1));
    availableComponentNames.forEach(async (componentName) => {
      const component = await screen.findByText(componentName);
      expect(component).toHaveTextContent(componentName + " Component Content");
    });
    expect(screen.queryByText("SomeOtherComponentName Component Content")).toBe(
      null
    );
  });
});

describe("ActivityDashboard functions", () => {
  describe("getSettings", () => {
    test("Happy path :: gets and returns settings", async () => {
      const authDetails = { userId: "fakeUserId" };
      const fakeAuthDetails = vi.fn().mockResolvedValue(authDetails);
      const response = { whoami: "ReturnedSettings" };
      const fakeFetch = vi.fn().mockResolvedValue({
        status: 200,
        json: vi.fn().mockResolvedValue(response),
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
      const fakeAuthDetails = vi.fn().mockResolvedValue(authDetails);
      const response = { whoami: "ReturnedSettings" };
      const fakeFetch = vi.fn().mockResolvedValue({
        status: 403,
        json: vi.fn().mockResolvedValue(response),
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
      const fakeAuthDetails = vi.fn().mockRejectedValue(authDetails);
      const fakeFetch = vi.fn();
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
      const fakeAuthDetails = vi.fn().mockResolvedValue(authDetails);
      const fakeFetch = vi.fn().mockRejectedValue({});
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
