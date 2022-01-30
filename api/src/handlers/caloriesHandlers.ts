import { Application, Request, Response } from 'express'
import { userRestrictedHandler } from '../utilities/UserRestrictedHandler'
import { getFitbitToken } from '../providers/FitbitAuthHandlers'
import { dailyCaloriesProvider, dateRangeCaloriesInOutProvider } from '../providers/FitbitStatProvider'

export function addCaloriesHandlers (app: Application) {
  app.get('/users/:userId/activities/:date/calories', (req, res) => userRestrictedHandler(req, res, getUserCalories))
  app.get('/users/:userId/activities/:dateStart/:dateEnd/calories', (req, res) => userRestrictedHandler(req, res, getUserCaloriesDateRange))
}

const getUserCalories = async (userId: string, req: Request, res: Response) => {
  if (!getFitbitToken(userId)) {
    return res.status(400).send({ status: 'No FitBit Token' })
  }

  const { date } = req.params

  const calories = await dailyCaloriesProvider(userId, new Date(date))

  return res.send(calories)
}

const getUserCaloriesDateRange = async (userId: string, req: Request, res: Response) => {
  if (!getFitbitToken(userId)) {
    return res.status(400).send({ status: 'No FitBit Token' })
  }

  const { dateStart, dateEnd } = req.params

  const caloriesInOut = await dateRangeCaloriesInOutProvider(userId, new Date(dateStart), new Date(dateEnd))

  return res.send(caloriesInOut)
}
