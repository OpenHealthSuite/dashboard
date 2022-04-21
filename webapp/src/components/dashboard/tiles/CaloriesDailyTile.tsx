import { DashboardTile, IDashboardTileProps } from "../DashboardTile";
import { API_ROOT } from "../../../secrets";
import { getAuthDetails } from "../../../services/AuthenticationDetails";

export interface ICalories {
  caloriesIn: number,
  caloriesOut: number
}

export async function getCaloriesForDay(
  day: Date,
  fnGetAuthDetails = getAuthDetails,
  fnFetch = fetch,
  apiRoot = API_ROOT
): Promise<ICalories> {
  const authDetails = await fnGetAuthDetails();
  const response = await fnFetch(
    apiRoot + "/users/" + authDetails.userId + "/activities/" + day.toISOString().split('T')[0] + '/calories'
  );
  if (response.status === 200) {
    return ((await response.json()) as ICalories)
  } else {
    throw new Error('Error retrieving calories')
  }
}


interface ICaloriesDailyTileProps {
  FnDashboardTile?: (props: IDashboardTileProps) => JSX.Element;
}

export function CaloriesDailyTile({
  FnDashboardTile = DashboardTile,
}: ICaloriesDailyTileProps) {
  return (
    <FnDashboardTile>
      <div data-testid="calories-daily-tile"></div>
    </FnDashboardTile>
  );
}
