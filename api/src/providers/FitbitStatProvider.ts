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

interface IDatedSleep {
  date: Date,
  sleep: ISleep
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

interface IFitbitSleepRange {
  dateOfSleep: string,
  minutesAsleep: number,
  minutesAwake: number,
  timeInBed: number
  levels: {
    summary: {
      deep: { minutes: number },
      light: { minutes: number },
      rem: { minutes: number },
      wake: { minutes: number }
    }
  }
}

// yyyy-MM-dd
function getFitbitDate (date: Date): string {
  return date.toISOString().split('T')[0]
}

// https://dev.fitbit.com/build/reference/web-api/activity/get-daily-activity-summary/
async function getDaySummary (userId: string, date: Date): Promise<IFitbitDaySummary | undefined> {
  return await makeFitbitRequest<IFitbitDaySummary>(userId, `/1/user/-/activities/date/${getFitbitDate(date)}.json`)
}

// https://dev.fitbit.com/build/reference/web-api/nutrition/get-food-log/
async function getFoodSummary (userId: string, date: Date): Promise<IFitbitFoodSummary | undefined> {
  return await makeFitbitRequest<IFitbitFoodSummary>(userId, `/1/user/-/foods/log/date/${getFitbitDate(date)}.json`)
}

// https://dev.fitbit.com/build/reference/web-api/sleep/get-sleep-log-by-date/
async function getSleepSummary (userId: string, date: Date): Promise<IFitbitSleepSummary | undefined> {
  return await makeFitbitRequest<IFitbitSleepSummary>(userId, `/1.2/user/-/sleep/date/${getFitbitDate(date)}.json`)
}

// https://dev.fitbit.com/build/reference/web-api/sleep/get-sleep-log-by-date-range/
async function getSleepInDateRange (userId: string, dateStart: Date, dateEnd: Date): Promise<{'sleep': IFitbitSleepRange[]} | undefined> {
  return await makeFitbitRequest<{'sleep': IFitbitSleepRange[]}>(userId, `/1.2/user/-/sleep/date/${getFitbitDate(dateStart)}/${getFitbitDate(dateEnd)}.json`)
}

// https://dev.fitbit.com/build/reference/web-api/activity-timeseries/get-activity-timeseries-by-date-range/
async function getStepsInDateRange (userId: string, dateStart: Date, dateEnd: Date): Promise<{'activities-steps': IFitbitDateValue[]} | undefined> {
  return await makeFitbitRequest<{'activities-steps': IFitbitDateValue[]}>(userId, `/1/user/-/activities/steps/date/${getFitbitDate(dateStart)}/${getFitbitDate(dateEnd)}.json`)
}

// https://dev.fitbit.com/build/reference/web-api/activity-timeseries/get-activity-timeseries-by-date-range/
async function getCaloriesBurnedInDateRange (userId: string, dateStart: Date, dateEnd: Date): Promise<{'activities-calories': IFitbitDateValue[]} | undefined> {
  return await makeFitbitRequest<{'activities-calories': IFitbitDateValue[]}>(userId, `/1/user/-/activities/calories/date/${getFitbitDate(dateStart)}/${getFitbitDate(dateEnd)}.json`)
}

// https://dev.fitbit.com/build/reference/web-api/nutrition-timeseries/get-nutrition-timeseries-by-date-range/
async function getCaloriesConsumedInDateRange (userId: string, dateStart: Date, dateEnd: Date): Promise<{'foods-log-caloriesIn': IFitbitDateValue[]} | undefined> {
  return await makeFitbitRequest<{'foods-log-caloriesIn': IFitbitDateValue[]}>(userId, `/1/user/-/foods/log/caloriesIn/date/${getFitbitDate(dateStart)}/${getFitbitDate(dateEnd)}.json`)
}

export async function dailyStepsProvider (userId: string, date: Date): Promise<IStepCount | undefined> {
  const daySummary = await getDaySummary(userId, date)
  return { count: daySummary && daySummary.summary ? daySummary.summary.steps : 0 }
}

export async function dailyCaloriesProvider (userId: string, date: Date): Promise<ICalories | undefined> {
  const daySummary = await getDaySummary(userId, date)
  const foodSummary = await getFoodSummary(userId, date)
  return {
    caloriesIn: foodSummary && foodSummary.summary ? foodSummary.summary.calories : 0,
    caloriesOut: daySummary && daySummary.summary ? daySummary.summary.caloriesOut : 0
  }
}

export async function dailySleepProvider (userId: string, date: Date): Promise<ISleep | undefined> {
  const rawData = await getSleepSummary(userId, date)
  if (!rawData || !rawData.summary || !rawData.summary.stages) {
    return undefined
  }
  const stages = rawData.summary.stages
  return {
    asleep: stages.light + stages.deep + stages.rem,
    rem: stages.rem,
    awake: stages.wake
  }
}

export async function dateRangeSleepProvider (userId: string, dateStart: Date, dateEnd: Date): Promise<IDatedSleep[] | undefined> {
  const rawSleep = await getSleepInDateRange(userId, dateStart, dateEnd)
  if (!rawSleep) {
    return undefined
  }
  return rawSleep.sleep.map((rs) => {
    return {
      date: new Date(rs.dateOfSleep),
      sleep: {
        awake: rs.minutesAwake || 0,
        rem: rs.levels.summary.rem ? rs.levels.summary.rem.minutes : 0,
        asleep: rs.minutesAsleep || 0
      }
    }
  })
}

export async function dateRangeStepProvider (userId: string, dateStart: Date, dateEnd: Date): Promise<IDatedSteps[] | undefined> {
  const rawSteps = await getStepsInDateRange(userId, dateStart, dateEnd)
  if (!rawSteps) {
    return undefined
  }
  return rawSteps['activities-steps'].map(rs => { return { steps: rs.value, date: new Date(rs.dateTime) } })
}

export async function dateRangeCaloriesBurnedProvider (userId: string, dateStart: Date, dateEnd: Date): Promise<IDatedCaloriesBurned[] | undefined> {
  const rawCaloriesBurned = await getCaloriesBurnedInDateRange(userId, dateStart, dateEnd)
  if (!rawCaloriesBurned) {
    return undefined
  }
  return rawCaloriesBurned['activities-calories'].map(rs => { return { caloriesOut: rs.value, date: new Date(rs.dateTime) } })
}

export async function dateRangeCaloriesConsumedrovider (userId: string, dateStart: Date, dateEnd: Date): Promise<IDatedCaloriesConsumed[] | undefined> {
  const rawCaloriesConsumed = await getCaloriesConsumedInDateRange(userId, dateStart, dateEnd)
  if (!rawCaloriesConsumed) {
    return undefined
  }
  return rawCaloriesConsumed['foods-log-caloriesIn'].map(rs => { return { caloriesIn: rs.value, date: new Date(rs.dateTime) } })
}

export async function dateRangeCaloriesInOutProvider (userId: string, dateStart: Date, dateEnd: Date): Promise<IDatedCaloriesInOut[] | undefined> {
  // This is a convenience provider
  const rawCaloriesBurned = await getCaloriesBurnedInDateRange(userId, dateStart, dateEnd)
  const rawCaloriesConsumed = await getCaloriesConsumedInDateRange(userId, dateStart, dateEnd)
  if (!rawCaloriesBurned || !rawCaloriesConsumed) {
    return undefined
  }
  return rawCaloriesBurned['activities-calories'].map(x => {
    return {
      date: new Date(x.dateTime),
      caloriesIn: rawCaloriesConsumed['foods-log-caloriesIn'].find(y => y.dateTime === x.dateTime)?.value ?? 0,
      caloriesOut: x.value
    }
  })
}
