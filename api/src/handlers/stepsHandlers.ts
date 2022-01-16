import { Application, Request, Response } from 'express'
import { userRestrictedHandler } from '../utilities/UserRestrictedHandler'
import { getFitbitToken } from '../providers/FitbitAuthHandlers'
import { dailyStepsProvider } from '../providers/FitbitStatProvider'

export function addStepHandlers (app: Application) {
  app.get('/users/:userId/activities/:date/steps', (req, res) => userRestrictedHandler(req, res, getUserSteps))
}

const getUserSteps = async (userId: string, req: Request, res: Response) => {
  if (!getFitbitToken(userId)) {
    return res.status(400).send({ status: 'No FitBit Token' })
  }

  const { date } = req.params

  const steps = await dailyStepsProvider(userId, new Date(date))

  return res.send(steps)
}
