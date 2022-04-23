import { getAuthDetails } from "../../services/AuthenticationDetails";
import {
  DEFAULT_DASHBOARD_SETTINGS,
  IDashboardSettings,
} from "../../services/SettingsService";
import { API_ROOT } from "../../secrets";
import "./ActivityDashboard.scss";
import { useEffect, useState } from "react";
import { AvailableTiles, IAvailableTiles } from "./tiles";
import { Grid } from "@mui/material";

export async function getDashboardSettings(
  fnGetAuthDetails = getAuthDetails,
  fnFetch = fetch,
  apiRoot = API_ROOT,
  defaults = DEFAULT_DASHBOARD_SETTINGS
): Promise<IDashboardSettings> {
  try {
    const authDetails = await fnGetAuthDetails();
    const response = await fnFetch(
      apiRoot + "/users/" + authDetails.userId + "/userSettings/dashboard"
    );
    return response.status === 200
      ? ((await response.json()) as IDashboardSettings)
      : defaults;
  } catch {
    return defaults;
  }
}

interface IDashboardProps {
  fnGetSettings?: () => Promise<IDashboardSettings>;
  availableTiles?: IAvailableTiles;
}

// eslint-disable-next-line no-empty-pattern
export function ActivityDashboard({
  fnGetSettings = getDashboardSettings,
  availableTiles = AvailableTiles,
}: IDashboardProps) {
  const [dashboardSettings, setDashboardSettings] = useState<
    IDashboardSettings | undefined
  >(undefined);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  useEffect(() => {
    fnGetSettings()
      .then(setDashboardSettings)
      .catch(() => setDashboardSettings(undefined))
      .finally(() => setSettingsLoaded(true));
  }, [fnGetSettings, setDashboardSettings, setSettingsLoaded]);
  if (settingsLoaded && dashboardSettings) {
    return (
      <Grid container spacing={dashboardSettings.spacing} alignItems="stretch">
        {dashboardSettings.tileSettings
          .filter((ts) =>
            Object.keys(availableTiles).includes(ts.componentName)
          )
          .map((ts) => availableTiles[ts.componentName])
          .map((tile, i) => {
            return (
              <Grid
                key={`gridkey-${i}`}
                item
                xs={dashboardSettings.tileSizes.xs}
                sm={dashboardSettings.tileSizes.sm}
                md={dashboardSettings.tileSizes.md}
              >
                <tile.component />
              </Grid>
            );
          })}
      </Grid>
    );
  }
  if (settingsLoaded) {
    return <>Error</>;
  }
  return <>Loading</>;
}
