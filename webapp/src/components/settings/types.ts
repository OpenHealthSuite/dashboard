import { AvailableTiles } from "../dashboard/tiles";

export type AvailableTileSetting = {
  componentName: string;
  componentNiceName: string;
};

export const ALL_AVAILABLE_TILES: AvailableTileSetting[] = Object.keys(
  AvailableTiles
).map((key) => {
  return {
    componentName: key,
    componentNiceName: AvailableTiles[key].displayName,
  };
});

export type TileSettings = {
  componentName: string;
};

export type DashboardSettings = {
  spacing: number;
  tileSizes: {
    xs: number;
    sm: number;
    md: number;
  };
  tileSettings: TileSettings[];
};

export const DEFAULT_DASHBOARD_SETTINGS: DashboardSettings = {
  spacing: 2,
  tileSizes: {
    xs: 12,
    sm: 6,
    md: 4,
  },
  tileSettings: [
    { componentName: "CaloriesDailyTile" },
    { componentName: "SleepDailyTile" },
    { componentName: "StepsGraphTile" },
    { componentName: "CaloriesGraphTile" },
  ],
};
