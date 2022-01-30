import { makeFitbitRequest } from './FitbitAuthHandlers'

interface IStepCount {
  count: number
}

interface IDatedSteps {
  steps: number,
  date: Date
}

interface IFitbitDateSteps {
  value: number,
  dateTime: Date
}

interface ICalories {
  in: number,
  out: number
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
async function getStepsInDateRange (userId: string, dateStart: Date, dateEnd: Date): Promise<{'activities-steps': IFitbitDateSteps[]}> {
  return await makeFitbitRequest<{'activities-steps': IFitbitDateSteps[]}>(userId, `/1/user/-/activities/steps/date/${getFitbitDate(dateStart)}/${getFitbitDate(dateEnd)}.json`)
}

export async function dailyStepsProvider (userId: string, date: Date): Promise<IStepCount> {
  const daySummary = await getDaySummary(userId, date)
  return { count: daySummary && daySummary.summary ? daySummary.summary.steps : 0 }
}

export async function dailyCaloriesProvider (userId: string, date: Date): Promise<ICalories> {
  const daySummary = await getDaySummary(userId, date)
  const foodSummary = await getFoodSummary(userId, date)
  return {
    in: foodSummary && foodSummary.summary ? foodSummary.summary.calories : 0,
    out: daySummary && daySummary.summary ? daySummary.summary.caloriesOut : 0
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
