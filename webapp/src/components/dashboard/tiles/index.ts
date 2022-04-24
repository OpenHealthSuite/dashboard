import { CaloriesDailyTile } from "./CaloriesDailyTile";
import { CaloriesGraphTile } from "./CaloriesGraphTile";
import { SleepDailyTile } from "./SleepDailyTile";
import { SleepGraphTile } from "./SleepGraphTile";
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
  SleepDailyTile: {
    displayName: "Sleep Daily Summary",
    component: SleepDailyTile,
  },
  SleepGraphTile: {
    displayName: "Sleep Graph",
    component: SleepGraphTile,
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
