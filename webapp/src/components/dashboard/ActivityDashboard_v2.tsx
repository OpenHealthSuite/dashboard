import { getAuthDetails } from "../../services/AuthenticationDetails";
import {
  DEFAULT_DASHBOARD_SETTINGS,
  IDashboardSettings,
} from "../../services/SettingsService";
import { API_ROOT } from "../../secrets";
import "./ActivityDashboard_v2.scss";

export async function getDashboardSettings({
  fnGetAuthDetails = getAuthDetails,
  fnFetch = fetch,
  apiRoot = API_ROOT,
  defaults = DEFAULT_DASHBOARD_SETTINGS,
}) {
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
  //fnGetSettings: () => IDashboardSettings;
}

// eslint-disable-next-line no-empty-pattern
export function ActivityDashboard({}: //fnGetSettings = getDashboardSettings,
IDashboardProps) {
  return <div className="test">Hello</div>;
}
