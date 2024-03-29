import { Application, Request, Response } from 'express'
import { userRestrictedHandler } from '../utilities/UserRestrictedHandler'
import { DashboardLocals } from '..'

export function addSleepHandlers (app: Application) {
  app.get('/api/users/:userId/sleep/:date', (req, res: Response<any, DashboardLocals>) => userRestrictedHandler(req, res, getUserSleepStats))
  app.get('/api/users/:userId/sleep/:dateStart/:dateEnd', (req, res: Response<any, DashboardLocals>) => userRestrictedHandler(req, res, getUserSleepRange))
}

const getUserSleepStats = async (userId: string, req: Request, res: Response<any, DashboardLocals>) => {
  const { date } = req.params

  if (!res.locals.dataProvider.sleepInformationForGivenDay) {
    return res.sendStatus(404)
  }

  const steps = await res.locals.dataProvider.sleepInformationForGivenDay(userId, new Date(date))

  return res.status(!steps ? 404 : 200).send(steps)
}

const getUserSleepRange = async (userId: string, req: Request, res: Response<any, DashboardLocals>) => {
  const { dateStart, dateEnd } = req.params

  if (!res.locals.dataProvider.sleepInformationForRangeOfDays) {
    return res.sendStatus(404)
  }

  const sleep = await res.locals.dataProvider.sleepInformationForRangeOfDays(userId, new Date(dateStart), new Date(dateEnd))

  return res.status(!sleep ? 404 : 200).send(sleep)
}
