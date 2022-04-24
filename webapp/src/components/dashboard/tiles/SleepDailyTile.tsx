import { DashboardTile } from "../DashboardTile";
import { useState } from "react";
import { pacemeUserRouteGetRequest } from "../../../services/PaceMeApiService";
import { formatMinutesToText } from "./utilities/TimeFunctions";

export const colors = {
  asleep: "#44C",
  rem: "#C4C",
  awake: "#C44"
};

export interface ISleep {
  asleep: number;
  rem: number;
  awake: number;
}

async function getSleepForDay(
  day: () => Date = () => new Date(),
  fnFetch = pacemeUserRouteGetRequest
): Promise<ISleep> {
  return fnFetch("/sleep/" + day().toISOString().split("T")[0]);
}

interface SleepDailyTileProps {
  fnGetDaySleep?: () => Promise<ISleep>;
}

export function SleepDailyTile({
  fnGetDaySleep = getSleepForDay,
}: SleepDailyTileProps) {
  const [sleep, setSleep] = useState<ISleep>();
  // TODO: This should be changed to refresh every day unless hasn't been reported - API needs updating first though
  const refreshIntervalMilliseconds = 1000 * 60 * 60; // Every hour

  return (
    <DashboardTile
      headerText="Last Night's Sleep"
      dataRetreivalFunction={fnGetDaySleep}
      setData={setSleep}
      refreshIntervalms={refreshIntervalMilliseconds}
    >
      <>
        {!sleep && (
          <div style={{ textAlign: "center" }}>No Sleep Data Available</div>
        )}
      {sleep && 
      <div style={{ textAlign: "center" }}>
        <h1 style={{ color: colors.asleep }}>{formatMinutesToText(sleep.asleep)}</h1>
        <h3 style={{ color: colors.rem }}>REM: {formatMinutesToText(sleep.rem)}</h3>
        <h4 style={{ color: colors.awake }}>Awake: {formatMinutesToText(sleep.awake)}</h4>
      </div>}
      </>
    </DashboardTile>
  );
}
