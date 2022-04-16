import { DashboardTile, IDashboardTileProps } from "../DashboardTile";

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
