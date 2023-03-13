export type IStepCount = {
  count: number
}

export type IDatedSteps = {
  steps: number,
  date: Date
}


export type IDatedCaloriesBurned = {
  caloriesOut: number,
  date: Date
}

export type IDatedCaloriesConsumed = {
  caloriesIn: number,
  date: Date
}

export type IDatedCaloriesInOut = {
  caloriesIn: number,
  caloriesOut: number,
  date: Date
}

export type ICaloriesIn = {
  caloriesIn: number,
}

export type ICaloriesOut = {
  caloriesOut: number
}

export type ISleep = {
  asleep: number,
  rem: number,
  awake: number
}

export type IDatedSleep = {
  date: Date,
  sleep: ISleep
}


export type dailyStepsProvider = (userId: string, date: Date) => Promise<IStepCount | undefined>

export type dailyCaloriesBurnedProvider = (userId: string, date: Date) => Promise<ICaloriesOut | undefined>

export type dailyCaloriesConsumedProvider = (userId: string, date: Date) => Promise<ICaloriesIn | undefined>

export type dailySleepProvider = (userId: string, date: Date) => Promise<ISleep | undefined>

export type dateRangeSleepProvider = (userId: string, dateStart: Date, dateEnd: Date) => Promise<IDatedSleep[] | undefined>

export type dateRangeStepProvider = (userId: string, dateStart: Date, dateEnd: Date) => Promise<IDatedSteps[] | undefined>

export type dateRangeCaloriesBurnedProvider = (userId: string, dateStart: Date, dateEnd: Date) => Promise<IDatedCaloriesBurned[] | undefined>

export type dateRangeCaloriesConsumedrovider = (userId: string, dateStart: Date, dateEnd: Date) => Promise<IDatedCaloriesConsumed[] | undefined>

export type DataProvider = {
  dailyStepsProvider?: dailyStepsProvider,
  dailyCaloriesBurnedProvider?: dailyCaloriesBurnedProvider,
  dailyCaloriesConsumedProvider?: dailyCaloriesConsumedProvider,
  dailySleepProvider?: dailySleepProvider,
  dateRangeSleepProvider?: dateRangeSleepProvider,
  dateRangeStepProvider?: dateRangeStepProvider,
  dateRangeCaloriesBurnedProvider?: dateRangeCaloriesBurnedProvider,
  dateRangeCaloriesConsumedProvider?: dateRangeCaloriesConsumedrovider
}