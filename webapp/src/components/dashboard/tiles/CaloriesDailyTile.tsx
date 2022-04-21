import { DashboardTile, IDashboardTileProps } from "../DashboardTile";
import { API_ROOT } from "../../../secrets";
import { getAuthDetails } from "../../../services/AuthenticationDetails";
import { useEffect, useState } from "react";

const colors = {
  caloriesIn: "#3A3",
  caloriesOut: "#A33",
  steps: "#44C",
};

export interface ICalories {
  caloriesIn: number;
  caloriesOut: number;
}

export async function getCaloriesForDay(
  day: Date,
  fnGetAuthDetails = getAuthDetails,
  fnFetch = fetch,
  apiRoot = API_ROOT
): Promise<ICalories> {
  const authDetails = await fnGetAuthDetails();
  const response = await fnFetch(
    apiRoot +
      "/users/" +
      authDetails.userId +
      "/activities/" +
      day.toISOString().split("T")[0] +
      "/calories"
  );
  if (response.status === 200) {
    return (await response.json()) as ICalories;
  } else {
    throw new Error("Error retrieving calories");
  }
}

interface ICaloriesDailyTileProps {
  FnDashboardTile?: (props: IDashboardTileProps) => JSX.Element;
  FnGetCaloriesForDay?: (day: Date) => Promise<ICalories>;
}

export function CaloriesDailyTile({
  FnDashboardTile = DashboardTile,
  FnGetCaloriesForDay = getCaloriesForDay,
}: ICaloriesDailyTileProps) {
  const [calories, setCalories] = useState<ICalories>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isErrored, setIsErrored] = useState<boolean>(false);

  useEffect(() => {
    FnGetCaloriesForDay(new Date())
      .then((calories) => {
        setCalories(calories);
        setIsErrored(false);
      })
      .catch((err) => {
        setIsErrored(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setIsErrored, setIsLoading, setCalories, FnGetCaloriesForDay]);

  useEffect(() => {
    const getCalories = () => {
      FnGetCaloriesForDay(new Date())
        .then((calories) => {
          setCalories(calories);
          setIsErrored(false);
        })
        .catch((err) => {
          setIsErrored(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };
    setInterval(() => {
      getCalories();
    }, 5 * 60 * 1000);
  }, [calories, setIsErrored, setIsLoading, setCalories, FnGetCaloriesForDay]);

  const todayCalorieDelta = calories
    ? calories.caloriesIn - calories.caloriesOut
    : 0;

  return (
    <FnDashboardTile
      error={isErrored}
      loading={isLoading}
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
