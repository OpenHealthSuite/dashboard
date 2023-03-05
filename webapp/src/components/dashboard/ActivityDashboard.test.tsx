import { screen, render } from "@testing-library/react";
import { DashboardSettingsContext } from "../../App";
import { ActivityDashboard } from "./ActivityDashboard";
import { IAvailableTiles } from "./tiles";

describe("ActivityDashboard", () => {
  test("Loading Renders", async () => {
    render(
      <DashboardSettingsContext.Provider value={undefined}>
        <ActivityDashboard availableTiles={{}} />
      </DashboardSettingsContext.Provider>
    );
    expect((await screen.findAllByText("Loading")).length).toBe(1);
  });
  test("Renders All Tiles", async () => {
    const fakeDashSettings = vi.fn();
    const componentNames = [
      "SomeComponentName",
      "SomeOtherComponentName",
      "LastComponentName",
    ];
    const fakeSettings = {
      spacing: 2,
      tileSettings: componentNames.map((componentName) => {
        return { componentName: componentName };
      }),
      tileSizes: {
        xs: 5,
        sm: 10,
        md: 12,
      },
    };

    const fakeAvailableTiles: IAvailableTiles = {};
    for (const key in componentNames) {
      fakeAvailableTiles[componentNames[key]] = {
        displayName: key + "DisplayName",
        component: () => <>{componentNames[key]} Component Content</>,
      };
    }
    render(
      <DashboardSettingsContext.Provider value={{ dashboardSettings: fakeSettings} as any}>
        <ActivityDashboard availableTiles={fakeAvailableTiles} />
      </DashboardSettingsContext.Provider>
    );
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
    const fakeSettings = {
      spacing: 2,
      tileSettings: componentNames.map((componentName) => {
        return { componentName: componentName };
      }),
      tileSizes: {
        xs: 5,
        sm: 10,
        md: 12,
      },
    };

    const fakeAvailableTiles: IAvailableTiles = {};
    for (const key in availableComponentNames) {
      fakeAvailableTiles[availableComponentNames[key]] = {
        displayName: key + "DisplayName",
        component: () => <>{availableComponentNames[key]} Component Content</>,
      };
    }
    render(
      <DashboardSettingsContext.Provider value={{ dashboardSettings: fakeSettings} as any}>
        <ActivityDashboard availableTiles={fakeAvailableTiles} />
      </DashboardSettingsContext.Provider>
    );
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
    const fakeSettings = {
      spacing: 2,
      tileSettings: componentNames.map((componentName) => {
        return { componentName: componentName };
      }),
      tileSizes: {
        xs: 5,
        sm: 10,
        md: 12,
      },
    };

    const fakeAvailableTiles: IAvailableTiles = {};
    for (const key in availableComponentNames) {
      fakeAvailableTiles[availableComponentNames[key]] = {
        displayName: key + "DisplayName",
        component: () => <>{availableComponentNames[key]} Component Content</>,
      };
    }
    render(
      <DashboardSettingsContext.Provider value={{ dashboardSettings: fakeSettings} as any}>
        <ActivityDashboard availableTiles={fakeAvailableTiles} />
      </DashboardSettingsContext.Provider>
    );
    availableComponentNames.forEach(async (componentName) => {
      const component = await screen.findByText(componentName);
      expect(component).toHaveTextContent(componentName + " Component Content");
    });
    expect(screen.queryByText("SomeOtherComponentName Component Content")).toBe(
      null
    );
  });
});
