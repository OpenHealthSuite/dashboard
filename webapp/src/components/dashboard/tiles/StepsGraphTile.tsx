import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { pacemeUserRouteGetRequest } from "../../../services/PaceMeApiService";

import { DashboardTile } from "../DashboardTile";
import { colors } from "./utilities/Colors";
import { fnLastWeekDate, fnYesterDate } from "./utilities/DateFunctions";

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface IDatedSteps {
  steps: number;
  date: Date;
}

interface StepsGraphTileProps {
  fnGetLastWeekOfSteps?: () => Promise<IDatedSteps[]>;
}

export async function getLastWeekOfSteps(
  dateStart: () => Date = fnYesterDate,
  dateEnd: () => Date = fnLastWeekDate
): Promise<IDatedSteps[]> {
  return pacemeUserRouteGetRequest<IDatedSteps[]>(
    "/" +
      [
        "activities",
        dateStart().toISOString().split("T")[0],
        dateEnd().toISOString().split("T")[0],
        "steps",
      ].join("/")
  );
}

export function StepsGraphTile({
  fnGetLastWeekOfSteps = getLastWeekOfSteps,
}: StepsGraphTileProps) {
  const [lastWeekStepsData, setLastWeekSteps] = useState<IDatedSteps[]>();

  const lastWeekSteps = lastWeekStepsData ?? [];
  const refreshIntervalMilliseconds = 1000 * 60 * 60; // Every hour

  const maxBarSize = Math.max(...lastWeekSteps.map((x) => x.steps));
  const totalSteps = lastWeekSteps
    .map((x) => x.steps - 0)
    .reduce((partial, a) => a + partial, 0);
  return (
    <DashboardTile
      headerText="Last Week Steps"
      dataRetreivalFunction={fnGetLastWeekOfSteps}
      setData={setLastWeekSteps}
      refreshIntervalms={refreshIntervalMilliseconds}
    >
      <>
        {!lastWeekStepsData && (
          <div style={{ textAlign: "center" }}>No Steps Data Available</div>
        )}
        {lastWeekStepsData && (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={lastWeekSteps.map((x) => {
                  return {
                    dateLabel: dayLabels[new Date(x.date).getDay()],
                    steps: x.steps,
                  };
                })}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis dataKey="dateLabel" />
                <YAxis
                  orientation="right"
                  type="number"
                  domain={[0, maxBarSize]}
                />
                <Bar
                  type="monotone"
                  dataKey="steps"
                  fill={colors.steps}
                  yAxisId={0}
                />
              </BarChart>
            </ResponsiveContainer>
            <p style={{ textAlign: "center" }}>
              Total: {totalSteps.toLocaleString()} |{" "}
              Avg: {Math.floor(totalSteps / lastWeekSteps.length).toLocaleString()}{" "}
            </p>
          </>
        )}
      </>
    </DashboardTile>
  );
}
