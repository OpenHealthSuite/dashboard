import { Application, Request, Response } from 'express'
import { userRestrictedHandler } from '../utilities/UserRestrictedHandler'
import { getFitbitToken } from '../providers/FitbitRequestProvider'
import { dailySleepProvider } from '../providers/FitbitStatProvider'

export function addSleepHandlers (app: Application) {
  app.get('/users/:userId/sleep/:date', (req, res) => userRestrictedHandler(req, res, getUserSleepStats))
}

const getUserSleepStats = async (userId: string, req: Request, res: Response) => {
  if (!getFitbitToken(userId)) {
    return res.status(400).send({ status: 'No FitBit Token' })
  }

  const { date } = req.params

  const steps = await dailySleepProvider(userId, new Date(date))

  return res.status(!steps ? 404 : 200).send(steps)
}
