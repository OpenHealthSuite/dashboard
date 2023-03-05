import {
  BrowserRouter as Router,
} from "react-router-dom";

import { Root } from './components/Root'

import { createContext, useCallback, useEffect, useState } from 'react';
import { DashboardSettings } from "./components/settings/types";
import { pacemeUserRouteGetRequest, pacemeUserRoutePutRequest } from "./services/PaceMeApiService";

type DashboardSettingsContext = {
  dashboardSettings: DashboardSettings,
  setDashboardSettings: (settings: DashboardSettings) => Promise<void>
}

export const DashboardSettingsContext = createContext<DashboardSettingsContext | undefined>(undefined);

function App() {
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings | undefined>(undefined);

  useEffect(() => {
    pacemeUserRouteGetRequest<DashboardSettings>('/userSettings/dashboard')
      .then(settings =>  setDashboardSettings(settings))
  }, [setDashboardSettings]);

  const apiSetDashboardSettings = useCallback(async (settings: DashboardSettings) => {
    await pacemeUserRoutePutRequest('/userSettings/dashboard', settings)
      .then(() =>  setDashboardSettings(settings))
  }, [setDashboardSettings])

  return (
    <DashboardSettingsContext.Provider value={dashboardSettings ? {dashboardSettings, setDashboardSettings: apiSetDashboardSettings} : undefined}>
      <Router>
        <Root />
      </Router>
    </DashboardSettingsContext.Provider>
  );
}


export default App;
