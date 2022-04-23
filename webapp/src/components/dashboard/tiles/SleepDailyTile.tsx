import { DashboardTile } from "../DashboardTile";
import { useState } from "react";
import { pacemeUserRouteGetRequest } from "../../../services/PaceMeApiService";

function formatMinutesToText(
  minutes: number,
  startString: string = ""
): string {
  if (minutes === 0) {
    return startString;
  }
  if (minutes < 60) {
    return `${startString} ${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  return formatMinutesToText(minutes - hours * 60, `${hours} hours`);
}

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
      headerText="Sleep"
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
        <h1>{formatMinutesToText(sleep.asleep)}</h1>
        <h3>REM: {formatMinutesToText(sleep.rem)}</h3>
        <h4>Awake: {formatMinutesToText(sleep.awake)}</h4>
      </div>}
      </>
    </DashboardTile>
  );
}
