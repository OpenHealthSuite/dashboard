import React from "react";
import { ActivityDashboard } from "./dashboard/ActivityDashboard";
import SettingsDashboard from "./settings/SettingsDashboard";

import {
  Routes,
  Route,
  Link,
  useParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { pacemeUserRoutePostRequest } from "../services/PaceMeApiService";
import { Box, Button, Container } from "@chakra-ui/react";

async function redeemCode(providerKey: string, code: string): Promise<{} | undefined> {
  return pacemeUserRoutePostRequest<{ code: string }, {}>(['/providers', providerKey, 'redeem'].join('/'), { code })
}

const CallbackRouteChild: React.FC = () => {
  const { serviceId } = useParams();
  const searchParams = new URLSearchParams(useLocation().search);
  const navigate = useNavigate();

  switch (serviceId) {
    case "fitbitauth":
      redeemCode("fitbit", searchParams.get("code") ?? "").finally(() =>
        navigate("/settings")
      );
      return <>Redeeming Fitbit Authentication Token...</>;
    default:
      // TODO: Error into a snackbar
      navigate("/settings");
      return <>Error redeeming token</>;
  }
}

export function Root() {

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = (open: boolean) => (event: any) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setDrawerOpen(open);
  };

  const path = useLocation().pathname

  const sidebarItems = [
    { linkDest: "/", name: "Dashboard" },
    { linkDest: "/settings", name: "Settings" },
  ].filter(i => i.linkDest !== path)
  .map((item) => (
    <Link
      onClick={toggleDrawer(false)}
      to={item.linkDest}
      key={item.name.toLowerCase().replace(" ", "")}
    >
      <Button size="sm">
        {item.name}
      </Button>
    </Link>
  ));
  return (
      <Box width="100vw" minHeight="100vh" position="relative" paddingBottom="2em">
        <Routes>
          <Route path="/callback/:serviceId" element={<CallbackRouteChild />} />
          <Route path="/settings" element={<SettingsDashboard />} />
          <Route path="/" element={<ActivityDashboard />} />
        </Routes>
        <Box position="absolute"
          bottom="0.5em"
          width="100%"
          display="flex"
          justifyContent="center"
          gap="1em">
          {sidebarItems}
        </Box>
      </Box>
  );
}
