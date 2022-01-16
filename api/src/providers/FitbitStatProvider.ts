import { makeFitbitRequest } from './FitbitAuthHandlers'

interface IStepCount {
  count: number
}

interface IFitbitDaySummary {
  summary: {
    steps: number
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

export async function dailyStepsProvider (userId: string, date: Date): Promise<IStepCount> {
  return { count: (await getDaySummary(userId, date)).summary.steps }
}
