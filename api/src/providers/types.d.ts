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

export type stepsForGivenDay = (userId: string, day: Date) => Promise<IStepCount | undefined>

export type caloriesBurnedForGivenDay = (userId: string, day: Date) => Promise<ICaloriesOut | undefined>

export type caloriesIngestedForGivenDay = (userId: string, day: Date) => Promise<ICaloriesIn | undefined>

export type sleepInformationforGivenDay = (userId: string, day: Date) => Promise<ISleep | undefined>

export type sleepInformationForRangeOfDays = (userId: string, beginningDay: Date, endingDay: Date) => Promise<IDatedSleep[] | undefined>

export type stepsForRangeOfDays = (userId: string, beginningDay: Date, endingDay: Date) => Promise<IDatedSteps[] | undefined>

export type caloriesBurnedForRangeOfDays = (userId: string, beginningDay: Date, endingDay: Date) => Promise<IDatedCaloriesBurned[] | undefined>

export type caloriesIngestedForRangeOfDays = (userId: string, beginningDay: Date, endingDay: Date) => Promise<IDatedCaloriesConsumed[] | undefined>

export type DataProvider = {
  stepsForGivenDay?: stepsForGivenDay,
  caloriesBurnedForGivenDay?: caloriesBurnedForGivenDay,
  caloriesIngestedForGivenDay?: caloriesIngestedForGivenDay,
  sleepInformationForGivenDay?: sleepInformationforGivenDay,
  sleepInformationForRangeOfDays?: sleepInformationForRangeOfDays,
  stepsForRangeOfDays?: stepsForRangeOfDays,
  caloriesBurnedForRangeOfDays?: caloriesBurnedForRangeOfDays,
  caloriesIngestedForRangeOfDays?: caloriesIngestedForRangeOfDays
}
