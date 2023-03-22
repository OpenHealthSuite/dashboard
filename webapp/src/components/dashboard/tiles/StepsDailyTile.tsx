import { DashboardTile } from "../DashboardTile";
import { useState } from "react";
import { pacemeUserRouteGetRequest } from "../../../services/PaceMeApiService";
import { colors } from "./utilities/Colors";

export interface ISteps {
  count: number;
}

async function getStepsForDay(
  day: () => Date = () => new Date(),
  fnFetch = pacemeUserRouteGetRequest
): Promise<ISteps> {
  return fnFetch("/activities/" + day().toISOString().split("T")[0] + "/steps");
}

interface SleepDailyTileProps {
  fnGetDaySteps?: () => Promise<ISteps>;
}

export function StepsDailyTile({
  fnGetDaySteps = getStepsForDay,
}: SleepDailyTileProps) {
  const [steps, setSteps] = useState<ISteps>();
  const refreshIntervalMilliseconds = 1000 * 60 * 5;

  return (
    <DashboardTile
      headerText="Today's Steps"
      dataRetreivalFunction={fnGetDaySteps}
      setData={setSteps}
      refreshIntervalms={refreshIntervalMilliseconds}
    >
      <>
        {!steps && (
          <div style={{ textAlign: "center" }}>No Step Data Available</div>
        )}
        {steps && (
          <div style={{ textAlign: "center" }}>
            <h1 style={{color: colors.steps}}>{steps.count.toLocaleString()} Steps</h1>
          </div>
        )}
      </>
    </DashboardTile>
  );
}
