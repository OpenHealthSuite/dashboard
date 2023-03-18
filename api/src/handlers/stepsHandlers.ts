import { Application, Request, Response } from 'express'
import { userRestrictedHandler } from '../utilities/UserRestrictedHandler'
import { DashboardLocals } from '..'

export function addStepHandlers (app: Application) {
  app.get('/api/users/:userId/activities/:date/steps', (req, res: Response<any, DashboardLocals>) => userRestrictedHandler(req, res, getUserSteps))
  app.get('/api/users/:userId/activities/:dateStart/:dateEnd/steps', (req, res: Response<any, DashboardLocals>) => userRestrictedHandler(req, res, getUserStepsRange))
}

const getUserSteps = async (userId: string, req: Request, res: Response<any, DashboardLocals>) => {
  const { date } = req.params

  if (!res.locals.dataProvider.stepsForGivenDay) {
    return res.sendStatus(404)
  }

  const steps = await res.locals.dataProvider.stepsForGivenDay(userId, new Date(date))

  return res.status(!steps ? 404 : 200).send(steps)
}

const getUserStepsRange = async (userId: string, req: Request, res: Response<any, DashboardLocals>) => {
  const { dateStart, dateEnd } = req.params

  if (!res.locals.dataProvider.stepsForRangeOfDays) {
    return res.sendStatus(404)
  }
  const steps = await res.locals.dataProvider.stepsForRangeOfDays(userId, new Date(dateStart), new Date(dateEnd))

  return res.status(!steps ? 404 : 200).send(steps)
}
