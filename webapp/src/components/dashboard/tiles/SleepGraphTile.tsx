import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { pacemeUserRouteGetRequest } from "../../../services/PaceMeApiService";

import { DashboardTile } from "../DashboardTile";
import { fnLastWeekDate, fnYesterDate } from "./utilities/DateFunctions";
import { formatMinutesToText } from "./utilities/TimeFunctions";

import { colors } from "./SleepDailyTile";

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface ISleep {
  asleep: number,
  rem: number,
  awake: number
}

interface IDatedSleep {
  date: Date,
  sleep: ISleep
}


interface SleepGraphTileProps {
  fnGetLastWeekOfSleep?: () => Promise<IDatedSleep[]>;
}

export async function getLastWeekOfSleep(
  dateStart: () => Date = fnLastWeekDate,
  dateEnd: () => Date = fnYesterDate
): Promise<IDatedSleep[]> {
  return pacemeUserRouteGetRequest<IDatedSleep[]>(
      [
        "/sleep",
        dateStart().toISOString().split("T")[0],
        dateEnd().toISOString().split("T")[0],
      ].join("/")
  );
}

export function SleepGraphTile({
  fnGetLastWeekOfSleep = getLastWeekOfSleep,
}: SleepGraphTileProps) {
  const [lastWeekSleepData, setLastWeekSleep] = useState<IDatedSleep[]>();

  const lastWeekSleep = lastWeekSleepData ?? [];
  const refreshIntervalMilliseconds = 1000 * 60 * 60; // Every hour

  const totalSleep = lastWeekSleep
    .map((x) => x.sleep.asleep - 0)
    .reduce((partial, a) => a + partial, 0);
  lastWeekSleep.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  return (
    <DashboardTile
      headerText="Last Week Sleep"
      dataRetreivalFunction={fnGetLastWeekOfSleep}
      setData={setLastWeekSleep}
      refreshIntervalms={refreshIntervalMilliseconds}
    >
      <>
        {!lastWeekSleepData && (
          <div style={{ textAlign: "center" }}>No Sleep Data Available</div>
        )}
        {lastWeekSleepData && (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={lastWeekSleep.map((x) => {
                  return {
                    dateLabel: dayLabels[new Date(x.date).getDay()],
                    asleep: x.sleep.asleep,
                    awake: x.sleep.awake,
                    rem: x.sleep.rem
                  };
                })}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis dataKey="dateLabel" />
                <YAxis
                  orientation="right"
                  type="number"
                  domain={[0, 'dataMax']}
                  dataKey="asleep"
                />
                <Bar
                  type="monotone"
                  dataKey="asleep"
                  fill={colors.asleep}
                  yAxisId={0}
                />
                <Bar
                  type="monotone"
                  dataKey="rem"
                  fill={colors.rem}
                  yAxisId={0}
                />
                <Bar
                  type="monotone"
                  dataKey="awake"
                  fill={colors.awake}
                  yAxisId={0}
                />
              </BarChart>
            </ResponsiveContainer>
            <p style={{ textAlign: "center" }}>
              {formatMinutesToText(totalSleep)} Total Sleep<br/>
              {formatMinutesToText(Math.floor(totalSleep / lastWeekSleep.length))}{" "}
              Avg.
            </p>
          </>
        )}
      </>
    </DashboardTile>
  );
}
