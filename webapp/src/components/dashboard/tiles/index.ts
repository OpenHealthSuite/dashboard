import { CaloriesDailyTile } from "./CaloriesDailyTile";
import { CaloriesGraphTile } from "./CaloriesGraphTile";
import { SleepDailyTile } from "./SleepDailyTile";
import { SleepGraphTile } from "./SleepGraphTile";
import { StepsDailyTile } from "./StepsDailyTile";
import { StepsGraphTile } from "./StepsGraphTile";

export interface IAvailableTile {
  displayName: string;
  component: (props: any) => JSX.Element;
}

export interface IAvailableTiles {
  [key: string]: IAvailableTile;
}

export const AvailableTiles: IAvailableTiles = {
  CaloriesDailyTile: {
    displayName: "Calories Daily Summary",
    component: CaloriesDailyTile,
  },
  CaloriesGraphTile: {
    displayName: "Calories Graph",
    component: CaloriesGraphTile,
  },
  SleepDailyTile: {
    displayName: "Sleep Daily Summary",
    component: SleepDailyTile,
  },
  SleepGraphTile: {
    displayName: "Sleep Graph",
    component: SleepGraphTile,
  },
  StepsDailyTile: {
    displayName: "Steps Daily Summary",
    component: StepsDailyTile,
  },
  StepsGraphTile: {
    displayName: "Steps Graph",
    component: StepsGraphTile,
  },
};
