import { getAuthDetails } from "../../services/AuthenticationDetails";
import { API_ROOT } from "../../secrets";
import "./ActivityDashboard.scss";
import { useEffect, useState } from "react";
import { AvailableTiles, IAvailableTiles } from "./tiles";
import { DEFAULT_DASHBOARD_SETTINGS, IDashboardSettings } from "../settings/sections/ActivityDashboardSettings";


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
      <div>
        {dashboardSettings.tileSettings
          .filter((ts) =>
            Object.keys(availableTiles).includes(ts.componentName)
          )
          .map((ts) => availableTiles[ts.componentName])
          .map((tile, i) => {
            return (
              <div
                key={`gridkey-${i}`}
              >
                <tile.component />
              </div>
            );
          })}
      </div>
    );
  }
  if (settingsLoaded) {
    return <>Error</>;
  }
  return <>Loading</>;
}
