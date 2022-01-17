import { makeFitbitRequest } from './FitbitAuthHandlers'

interface IStepCount {
  count: number
}

interface ICalories {
  in: number,
  out: number
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
