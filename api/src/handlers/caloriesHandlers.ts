import { Application, Request, Response } from 'express'
import { userRestrictedHandler } from '../utilities/UserRestrictedHandler'
import { DataProvider, ICaloriesIn, ICaloriesOut } from '../providers/types'
import { DashboardLocals } from '..'

export function addCaloriesHandlers (app: Application) {
  app.get('/api/users/:userId/activities/:date/calories', (req, res: Response<any, DashboardLocals>) => userRestrictedHandler(req, res, getUserCalories))
  app.get('/api/users/:userId/activities/:dateStart/:dateEnd/calories', (req, res: Response<any, DashboardLocals>) => userRestrictedHandler(req, res, getUserCaloriesDateRange))
}

const dailyCalories = async (userId: string, dateStart: Date, dataProvider: DataProvider): Promise<ICaloriesIn & ICaloriesOut | undefined> => {
  if (!dataProvider.dailyCaloriesBurnedProvider || !dataProvider.dailyCaloriesConsumedProvider) {
    return undefined
  }
  const consumed = await dataProvider.dailyCaloriesConsumedProvider(userId, dateStart)
  const burned = await dataProvider.dailyCaloriesBurnedProvider(userId, dateStart)
  if (!consumed || !burned) {
    return undefined
  }
  return {
    ...consumed,
    ...burned
  }
}

const dateRangeCaloriesInOut = async (userId: string, dateStart: Date, dateEnd: Date, dataProvider: DataProvider) => {
  if (!dataProvider.dateRangeCaloriesBurnedProvider || !dataProvider.dateRangeCaloriesConsumedProvider) {
    return undefined
  }
  const rawCaloriesBurned = await dataProvider.dateRangeCaloriesBurnedProvider(userId, dateStart, dateEnd)
  const rawCaloriesConsumed = await dataProvider.dateRangeCaloriesConsumedProvider(userId, dateStart, dateEnd)
  if (!rawCaloriesBurned || !rawCaloriesConsumed) {
    return undefined
  }
  return rawCaloriesBurned.map(x => {
    return {
      date: new Date(x.date),
      caloriesIn: rawCaloriesConsumed.find(y => y.date.toISOString().split('T')[0] === x.date.toISOString().split('T')[0])?.caloriesIn ?? 0,
      caloriesOut: x.caloriesOut
    }
  })
}

const getUserCalories = async (userId: string, req: Request, res: Response<any, DashboardLocals>) => {
  const { date } = req.params

  const calories = await dailyCalories(userId, new Date(date), res.locals.dataProvider)

  return res.status(!calories ? 404 : 200).send(calories)
}

const getUserCaloriesDateRange = async (userId: string, req: Request, res: Response<any, DashboardLocals>) => {
  const { dateStart, dateEnd } = req.params

  const caloriesInOut = await dateRangeCaloriesInOut(userId, new Date(dateStart), new Date(dateEnd), res.locals.dataProvider)

  return res.status(!caloriesInOut ? 404 : 200).send(caloriesInOut)
}
