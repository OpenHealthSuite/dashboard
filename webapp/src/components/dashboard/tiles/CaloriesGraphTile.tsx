import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { pacemeUserRouteGetRequest } from "../../../services/PaceMeApiService";

import { IDashboardTileProps, DashboardTile } from "../DashboardTile";
import { colors } from "./utilities/Colors";
import { fnLastWeekDate, fnYesterDate } from "./utilities/DateFunctions";

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface IDatedCaloriesInOut {
  caloriesIn: number;
  caloriesOut: number;
  date: Date;
}

interface CaloriesGraphTileProps {
  fnGetLastWeekOfCalories?: () => Promise<IDatedCaloriesInOut[]>;
  FnDashboardTile?: (
    props: IDashboardTileProps<IDatedCaloriesInOut[]>
  ) => JSX.Element;
}

export async function getLastWeekOfCalories(
  dateStart: () => Date = fnYesterDate,
  dateEnd: () => Date = fnLastWeekDate
): Promise<IDatedCaloriesInOut[]> {
  return pacemeUserRouteGetRequest<IDatedCaloriesInOut[]>(
    "/" +
      [
        "activities",
        dateStart().toISOString().split("T")[0],
        dateEnd().toISOString().split("T")[0],
        "calories",
      ].join("/")
  );
}

export function CaloriesGraphTile({
  fnGetLastWeekOfCalories = getLastWeekOfCalories,
  FnDashboardTile = DashboardTile,
}: CaloriesGraphTileProps) {
  const [caloriesArrayData, setCaloriesArray] =
    useState<IDatedCaloriesInOut[]>();
  const refreshIntervalMilliseconds = 1000 * 60 * 60; // Every hour
  const caloriesArray = caloriesArrayData ?? [];
  const caloriesInTotal = caloriesArray
    .map((x) => x.caloriesIn - 0)
    .reduce((partial, a) => a + partial, 0);
  const caloriesOutTotal = caloriesArray
    .map((x) => x.caloriesOut - 0)
    .reduce((partial, a) => a + partial, 0);
  const caloriesDelta = caloriesInTotal - caloriesOutTotal;
  const caloriesString = `In: ${caloriesInTotal.toLocaleString()}  |  Out: ${caloriesOutTotal.toLocaleString()}  |  Delta: ${caloriesDelta.toLocaleString()}`;
  return (
    <FnDashboardTile
      headerText="Last Week Calories"
      dataRetreivalFunction={fnGetLastWeekOfCalories}
      setData={setCaloriesArray}
      refreshIntervalms={refreshIntervalMilliseconds}
    >
      <>
        {!caloriesArrayData && (
          <div style={{ textAlign: "center" }}>No Calorie Data Available</div>
        )}
        {caloriesArrayData && (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={caloriesArray.map((x) => {
                  return {
                    dateLabel: dayLabels[new Date(x.date).getDay()],
                    caloriesIn: x.caloriesIn,
                    caloriesOut: x.caloriesOut,
                  };
                })}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis dataKey="dateLabel" />
                <YAxis orientation="right" />
                <Bar
                  type="monotone"
                  dataKey="caloriesIn"
                  fill={colors.caloriesIn}
                  yAxisId={0}
                />
                <Bar
                  type="monotone"
                  dataKey="caloriesOut"
                  fill={colors.caloriesOut}
                  yAxisId={0}
                />
              </BarChart>
            </ResponsiveContainer>
            <p style={{ textAlign: "center" }}>{caloriesString}</p>
          </>
        )}
      </>
    </FnDashboardTile>
  );
}
