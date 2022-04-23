import { DashboardTile, IDashboardTileProps } from "../DashboardTile";
import { useState } from "react";
import { pacemeUserRouteGetRequest } from "../../../services/PaceMeApiService";

const colors = {
  caloriesIn: "#3A3",
  caloriesOut: "#A33",
  steps: "#44C",
};

export interface ICalories {
  caloriesIn: number;
  caloriesOut: number;
}

async function getCaloriesForDay(
  day: () => Date = () => new Date(),
  fnFetch = pacemeUserRouteGetRequest
): Promise<ICalories> {
  return fnFetch(
    "/activities/" + day().toISOString().split("T")[0] + "/calories"
  );
}

interface ICaloriesDailyTileProps {
  FnDashboardTile?: (props: IDashboardTileProps<ICalories>) => JSX.Element;
  FnGetCalories?: () => Promise<ICalories>;
}

export function CaloriesDailyTile({
  FnDashboardTile = DashboardTile,
  FnGetCalories = getCaloriesForDay,
}: ICaloriesDailyTileProps) {
  const [calories, setCalories] = useState<ICalories>();

  const todayCalorieDelta = calories
    ? calories.caloriesIn - calories.caloriesOut
    : 0;

  return (
    <FnDashboardTile
      dataRetreivalFunction={FnGetCalories}
      setData={setCalories}
      refreshIntervalms={5 * 60 * 1000}
      headerText="Today's Calories"
    >
      <div data-testid="calories-daily-tile">
        {calories && (
          <div style={{ textAlign: "center" }}>
            <h1>
              <span style={{ color: colors.caloriesIn }}>
                {calories.caloriesIn.toLocaleString()} In
              </span>{" "}
              -{" "}
              <span style={{ color: colors.caloriesOut }}>
                {calories.caloriesOut.toLocaleString()} Out
              </span>
            </h1>
            <h2
              style={{
                color:
                  todayCalorieDelta < 0
                    ? colors.caloriesOut
                    : colors.caloriesIn,
              }}
            >
              {todayCalorieDelta.toLocaleString()} Calories Delta
            </h2>
          </div>
        )}
        {!calories && (
          <div style={{ textAlign: "center" }}>No Calorie Data Available</div>
        )}
      </div>
    </FnDashboardTile>
  );
}
