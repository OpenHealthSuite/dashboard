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
  day: Date,
  fnFetch = pacemeUserRouteGetRequest
): Promise<ICalories> {
  return fnFetch(
    "/activities/" + day.toISOString().split("T")[0] + "/calories"
  );
}

interface ICaloriesDailyTileProps {
  data: undefined | ICalories;
  FnDashboardTile?: (props: IDashboardTileProps<ICalories>) => JSX.Element;
  FnGetCalories?: (
    setIsErrored: (err: boolean) => void,
    setIsLoading: (lod: boolean) => void,
    setCalories: (data: ICalories | undefined) => void
  ) => Promise<void>;
}

const getCaloriesDataGetter = (
  setIsErrored: (err: boolean) => void,
  setIsLoading: (lod: boolean) => void,
  setCalories: (data: ICalories | undefined) => void,
  FnGetCaloriesForDay: (day: Date) => Promise<ICalories> = getCaloriesForDay
) => {
  return FnGetCaloriesForDay(new Date())
    .then((calories: ICalories) => {
      setCalories(calories);
      setIsErrored(false);
    })
    .catch(() => {
      setIsErrored(true);
    })
    .finally(() => {
      setIsLoading(false);
    });
};

export function CaloriesDailyTile({
  FnDashboardTile = DashboardTile,
  FnGetCalories = getCaloriesDataGetter,
}: ICaloriesDailyTileProps) {
  const [calories, setCalories] = useState<ICalories>();

  const todayCalorieDelta = calories
    ? calories.caloriesIn - calories.caloriesOut
    : 0;

  return (
    <FnDashboardTile
      dataGet={FnGetCalories}
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
