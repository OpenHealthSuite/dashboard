import { Application, Request, Response } from 'express'
import { getFitbitToken } from './FitbitHandlers'
import { userRestrictedHandler } from '../utilities/UserRestrictedHandler'

interface IProviderStatus {
  key: string,
  name: string,
  authenticated: boolean
}

export function addProviderRoutes (app: Application) {
  app.get('/users/:userId/providers', (req, res) => userRestrictedHandler(req, res, getProviderStatuses))
}

async function getProviderStatuses (userId: string, req: Request, res: Response) {
  const fitbitToken = await getFitbitToken(userId)
  const providerStatuses: IProviderStatus[] = [{
    key: 'fitbit',
    name: 'FitBit',
    authenticated: !!fitbitToken
  }]
  return res.send(providerStatuses)
}
