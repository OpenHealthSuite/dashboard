import { DashboardTile, IDashboardTileProps } from "../DashboardTile";
import { useState } from "react";
import { pacemeUserRouteGetRequest } from "../../../services/PaceMeApiService";
import { colors } from "./utilities/Colors";

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

export function CaloriesOutDailyTile({
  FnDashboardTile = DashboardTile,
  FnGetCalories = getCaloriesForDay,
}: ICaloriesDailyTileProps) {
  const [calories, setCalories] = useState<ICalories>();

  return (
    <FnDashboardTile
      dataRetreivalFunction={FnGetCalories}
      setData={setCalories}
      refreshIntervalms={5 * 60 * 1000}
      headerText="Today's Calories Burned"
    >
      <div data-testid="calories-daily-tile">
        {calories && (
          <div style={{ textAlign: "center" }}>
            <h1>
              <span style={{ color: colors.caloriesOut }}>
                {calories.caloriesOut.toLocaleString()} Out
              </span>
            </h1>
          </div>
        )}
        {!calories && (
          <div style={{ textAlign: "center" }}>No Calorie Burn Data Available</div>
        )}
      </div>
    </FnDashboardTile>
  );
}
