import { Application, Request, Response } from 'express'
import { userRestrictedHandler } from '../utilities/UserRestrictedHandler'
import { getFitbitToken } from '../providers/FitbitRequestProvider'
import { dailySleepProvider, dateRangeSleepProvider } from '../providers/FitbitStatProvider'

export function addSleepHandlers (app: Application) {
  app.get('/api/users/:userId/sleep/:date', (req, res) => userRestrictedHandler(req, res, getUserSleepStats))
  app.get('/api/users/:userId/sleep/:dateStart/:dateEnd', (req, res) => userRestrictedHandler(req, res, getUserSleepRange))
}

const getUserSleepStats = async (userId: string, req: Request, res: Response) => {
  if (!getFitbitToken(userId)) {
    return res.status(400).send({ status: 'No FitBit Token' })
  }

  const { date } = req.params

  const steps = await dailySleepProvider(userId, new Date(date))

  return res.status(!steps ? 404 : 200).send(steps)
}

const getUserSleepRange = async (userId: string, req: Request, res: Response) => {
  if (!getFitbitToken(userId)) {
    return res.status(400).send({ status: 'No FitBit Token' })
  }

  const { dateStart, dateEnd } = req.params

  const sleep = await dateRangeSleepProvider(userId, new Date(dateStart), new Date(dateEnd))

  return res.status(!sleep ? 404 : 200).send(sleep)
}
