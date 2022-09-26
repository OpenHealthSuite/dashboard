import React from "react";
import { ActivityDashboard } from "./dashboard/ActivityDashboard";
import SettingsDashboard from "./settings/SettingsDashboard";

import {
  Switch,
  Route,
  Link,
  useParams,
  useLocation,
  useHistory,
} from "react-router-dom";
import { pacemeUserRoutePostRequest } from "../services/PaceMeApiService";

interface ICallbackParameters {
  serviceId: string;
}

async function redeemCode(providerKey: string, code: string): Promise<{} | undefined> {
  return pacemeUserRoutePostRequest<{ code: string }, {}>(['/providers', providerKey, 'redeem'].join('/'), { code })
}

function CallbackRouteChild() {
  const { serviceId } = useParams<ICallbackParameters>();
  const searchParams = new URLSearchParams(useLocation().search);
  const navigate = useHistory();

  switch (serviceId) {
    case "fitbitauth":
      redeemCode("fitbit", searchParams.get("code") ?? "").finally(() =>
        navigate.push("/settings")
      );
      return <>Redeeming Fitbit Authentication Token...</>;
    default:
      // TODO: Error into a snackbar
      navigate.push("/settings");
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

  const sidebarItems = [
    { linkDest: "/", name: "Dashboard" },
    { linkDest: "/settings", name: "Settings" },
  ].map((item) => (
    <Link
      onClick={toggleDrawer(false)}
      to={item.linkDest}
      key={item.name.toLowerCase().replace(" ", "")}
    >
      {item.name}
    </Link>
  ));
  return (
    <>
      <Switch>
        <Route path="/callback/:serviceId" children={<CallbackRouteChild />} />
        <Route path="/settings" children={<SettingsDashboard />} />
        <Route path="/" children={<ActivityDashboard />} />
      </Switch>
      {drawerOpen && <div>
        {sidebarItems}
      </div>}
      <div>
        <button aria-label="menu" onClick={toggleDrawer(true)}>
          Menu
        </button>
      </div>
    </>
  );
}
