import { CaloriesGraphTile } from "./CaloriesGraphTile";
import { CaloriesStepsDailyTile } from "./CaloriesStepsDailyTile";
import { SleepDailyTile } from "./SleepDailyTile";
import { StepsGraphTile } from "./StepsGraphTile";

export interface IAvailableTiles {
  [key: string]: {
    displayName: string;
    component: (props: any) => JSX.Element;
  };
}

export const AvailableTiles: IAvailableTiles = {
  CaloriesStepsDailyTile: {
    displayName: "Calories/Steps Daily Summary",
    component: CaloriesStepsDailyTile,
  },
  SleepDailyTile: {
    displayName: "Sleep Daily Summary",
    component: SleepDailyTile,
  },
  StepsGraphTile: {
    displayName: "Steps Graph",
    component: StepsGraphTile,
  },
  CaloriesGraphTile: {
    displayName: "Calories Graph",
    component: CaloriesGraphTile,
  },
};
