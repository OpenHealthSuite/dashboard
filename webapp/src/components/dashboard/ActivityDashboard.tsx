import "./ActivityDashboard.scss";
import { useContext } from "react";
import { AvailableTiles, IAvailableTiles } from "./tiles";
import { DashboardSettingsContext } from "../../App";

interface IDashboardProps {
  availableTiles?: IAvailableTiles;
}

// eslint-disable-next-line no-empty-pattern
export function ActivityDashboard({
  availableTiles = AvailableTiles,
}: IDashboardProps) {
  const settingsContext = useContext(DashboardSettingsContext);
  const dashboardSettings = settingsContext?.dashboardSettings;
  if (settingsContext && dashboardSettings) {
    return (
      <div className={"dashboard-grid"}>
        {dashboardSettings.tileSettings
          .filter((ts) =>
            Object.keys(availableTiles).includes(ts.componentName)
          )
          .map((ts) => availableTiles[ts.componentName])
          .map((tile, i) => {
            return (
              <div
                className={"dashboard-grid-item"}
                key={`gridkey-${i}`}
              >
                <tile.component />
              </div>
            );
          })}
      </div>
    );
  }
  if (settingsContext) {
    return <>Error</>;
  }
  return <>Loading</>;
}
