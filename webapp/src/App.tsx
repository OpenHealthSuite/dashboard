import {
  BrowserRouter as Router,
} from "react-router-dom";
import { ChakraProvider } from '@chakra-ui/react'
import { extendTheme } from "@chakra-ui/react";

import { Root } from './components/Root'

import { createContext, useCallback, useEffect, useState } from 'react';
import { DashboardSettings, DEFAULT_DASHBOARD_SETTINGS } from "./components/settings/types";
import { pacemeUserRouteGetRequest, pacemeUserRoutePutRequest } from "./services/PaceMeApiService";

export type DashboardSettingsContextType = {
  dashboardSettings: DashboardSettings,
  setDashboardSettings: (settings: DashboardSettings) => Promise<void>
}

export const DashboardSettingsContext = createContext<DashboardSettingsContextType | undefined>(undefined);

const colors = {
  brand: {},
};

const theme = extendTheme({ colors });

function App() {
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings | undefined>(undefined);
  const [, updateState] = useState<{} | undefined>();
  const forceUpdate = useCallback(() => updateState({}), []);

  useEffect(() => {
    pacemeUserRouteGetRequest<DashboardSettings>('/userSettings/dashboard')
      .then(settings => setDashboardSettings(settings))
      .catch(() => setDashboardSettings(DEFAULT_DASHBOARD_SETTINGS))
  }, [setDashboardSettings]);

  const apiSetDashboardSettings = useCallback(async (settings: DashboardSettings) => {
    await pacemeUserRoutePutRequest('/userSettings/dashboard', settings)
      .then(() =>  setDashboardSettings(settings))
      .finally(() => forceUpdate())
  }, [setDashboardSettings, forceUpdate])

  const context = dashboardSettings ? {dashboardSettings, setDashboardSettings: apiSetDashboardSettings} : undefined;

  return (
    <ChakraProvider theme={theme}>
      <DashboardSettingsContext.Provider value={context}>
        <Router>
          <Root />
        </Router>
      </DashboardSettingsContext.Provider>
    </ChakraProvider>
  );
}


export default App;
