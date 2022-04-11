import { getAuthDetails } from "../../services/AuthenticationDetails";
import {
  DEFAULT_DASHBOARD_SETTINGS,
  IDashboardSettings,
} from "../../services/SettingsService";
import { API_ROOT } from "../../secrets";
import "./ActivityDashboard_v2.scss";
import { useEffect, useState } from "react";

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
}

// eslint-disable-next-line no-empty-pattern
export function ActivityDashboard({
  fnGetSettings = getDashboardSettings,
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

  return settingsLoaded && dashboardSettings ? (
    <ul>
      {dashboardSettings.tileSettings.map((setting, i) => (
        <li key={"tile" + i}>{setting.componentName}</li>
      ))}
    </ul>
  ) : settingsLoaded ? (
    <>Error</>
  ) : (
    <>Loading</>
  );
}
