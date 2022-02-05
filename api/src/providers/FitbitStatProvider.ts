import { makeFitbitRequest } from './FitbitRequestProvider'

interface IStepCount {
  count: number
}

interface IDatedSteps {
  steps: number,
  date: Date
}

interface IFitbitDateValue {
  value: number,
  dateTime: string
}

interface IDatedCaloriesBurned {
  caloriesOut: number,
  date: Date
}

interface IDatedCaloriesConsumed {
  caloriesIn: number,
  date: Date
}

interface IDatedCaloriesInOut {
  caloriesIn: number,
  caloriesOut: number,
  date: Date
}

interface ICalories {
  caloriesIn: number,
  caloriesOut: number
}

interface ISleep {
  asleep: number,
  rem: number,
  awake: number
}

interface IFitbitDaySummary {
  summary: {
    steps: number,
    caloriesOut: number
  }
}

interface IFitbitFoodSummary {
  summary: {
    calories: number
  }
}

interface IFitbitSleepSummary {
  summary: {
    stages: {
      deep: number,
      light: number,
      rem: number,
      wake: number
    }
    totalMinutesAsleep: number,
    totalSleepRecords: number,
    totalTimeInBed: number
  }
}

// yyyy-MM-dd
function getFitbitDate (date: Date): string {
  return date.toISOString().split('T')[0]
}

// https://dev.fitbit.com/build/reference/web-api/activity/get-daily-activity-summary/
async function getDaySummary (userId: string, date: Date): Promise<IFitbitDaySummary> {
  return await makeFitbitRequest<IFitbitDaySummary>(userId, `/1/user/-/activities/date/${getFitbitDate(date)}.json`)
}

// https://dev.fitbit.com/build/reference/web-api/nutrition/get-food-log/
async function getFoodSummary (userId: string, date: Date): Promise<IFitbitFoodSummary> {
  return await makeFitbitRequest<IFitbitFoodSummary>(userId, `/1/user/-/foods/log/date/${getFitbitDate(date)}.json`)
}

// https://dev.fitbit.com/build/reference/web-api/sleep/get-sleep-log-by-date/
async function getSleepSummary (userId: string, date: Date): Promise<IFitbitSleepSummary> {
  return await makeFitbitRequest<IFitbitSleepSummary>(userId, `/1.2/user/-/sleep/date/${getFitbitDate(date)}.json`)
}

// https://dev.fitbit.com/build/reference/web-api/activity-timeseries/get-activity-timeseries-by-date-range/
async function getStepsInDateRange (userId: string, dateStart: Date, dateEnd: Date): Promise<{'activities-steps': IFitbitDateValue[]}> {
  return await makeFitbitRequest<{'activities-steps': IFitbitDateValue[]}>(userId, `/1/user/-/activities/steps/date/${getFitbitDate(dateStart)}/${getFitbitDate(dateEnd)}.json`)
}

// https://dev.fitbit.com/build/reference/web-api/activity-timeseries/get-activity-timeseries-by-date-range/
async function getCaloriesBurnedInDateRange (userId: string, dateStart: Date, dateEnd: Date): Promise<{'activities-calories': IFitbitDateValue[]}> {
  return await makeFitbitRequest<{'activities-calories': IFitbitDateValue[]}>(userId, `/1/user/-/activities/calories/date/${getFitbitDate(dateStart)}/${getFitbitDate(dateEnd)}.json`)
}

// https://dev.fitbit.com/build/reference/web-api/nutrition-timeseries/get-nutrition-timeseries-by-date-range/
async function getCaloriesConsumedInDateRange (userId: string, dateStart: Date, dateEnd: Date): Promise<{'foods-log-caloriesIn': IFitbitDateValue[]}> {
  return await makeFitbitRequest<{'foods-log-caloriesIn': IFitbitDateValue[]}>(userId, `/1/user/-/foods/log/caloriesIn/date/${getFitbitDate(dateStart)}/${getFitbitDate(dateEnd)}.json`)
}

export async function dailyStepsProvider (userId: string, date: Date): Promise<IStepCount> {
  const daySummary = await getDaySummary(userId, date)
  return { count: daySummary && daySummary.summary ? daySummary.summary.steps : 0 }
}

export async function dailyCaloriesProvider (userId: string, date: Date): Promise<ICalories> {
  const daySummary = await getDaySummary(userId, date)
  const foodSummary = await getFoodSummary(userId, date)
  return {
    caloriesIn: foodSummary && foodSummary.summary ? foodSummary.summary.calories : 0,
    caloriesOut: daySummary && daySummary.summary ? daySummary.summary.caloriesOut : 0
  }
}

export async function dailySleepProvider (userId: string, date: Date): Promise<ISleep> {
  const rawData = await getSleepSummary(userId, date)
  const stages = rawData.summary.stages
  return {
    asleep: stages.light + stages.deep + stages.rem,
    rem: stages.rem,
    awake: stages.wake
  }
}

export async function dateRangeStepProvider (userId: string, dateStart: Date, dateEnd: Date): Promise<IDatedSteps[]> {
  const rawSteps = await getStepsInDateRange(userId, dateStart, dateEnd)
  return rawSteps['activities-steps'].map(rs => { return { steps: rs.value, date: new Date(rs.dateTime) } })
}

export async function dateRangeCaloriesBurnedProvider (userId: string, dateStart: Date, dateEnd: Date): Promise<IDatedCaloriesBurned[]> {
  const rawCaloriesBurned = await getCaloriesBurnedInDateRange(userId, dateStart, dateEnd)
  return rawCaloriesBurned['activities-calories'].map(rs => { return { caloriesOut: rs.value, date: new Date(rs.dateTime) } })
}

export async function dateRangeCaloriesConsumedrovider (userId: string, dateStart: Date, dateEnd: Date): Promise<IDatedCaloriesConsumed[]> {
  const rawCaloriesConsumed = await getCaloriesConsumedInDateRange(userId, dateStart, dateEnd)
  return rawCaloriesConsumed['foods-log-caloriesIn'].map(rs => { return { caloriesIn: rs.value, date: new Date(rs.dateTime) } })
}

export async function dateRangeCaloriesInOutProvider (userId: string, dateStart: Date, dateEnd: Date): Promise<IDatedCaloriesInOut[]> {
  // This is a convenience provider
  const rawCaloriesBurned = await getCaloriesBurnedInDateRange(userId, dateStart, dateEnd)
  const rawCaloriesConsumed = await getCaloriesConsumedInDateRange(userId, dateStart, dateEnd)
  return rawCaloriesBurned['activities-calories'].map(x => {
    return {
      date: new Date(x.dateTime),
      caloriesIn: rawCaloriesConsumed['foods-log-caloriesIn'].find(y => y.dateTime === x.dateTime)?.value ?? 0,
      caloriesOut: x.value
    }
  })
}
