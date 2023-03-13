import { Application, Request, Response } from 'express'
import { getFitbitToken } from '../providers/Fitbit/FitbitRequestProvider'
import { userRestrictedHandler } from '../utilities/UserRestrictedHandler'
import { DashboardLocals } from '..'

interface IProviderStatus {
  key: string,
  name: string,
  authenticated: boolean
}

export function addProviderRoutes (app: Application) {
  app.get('/api/users/:userId/providers', (req, res: Response<any, DashboardLocals>) => userRestrictedHandler(req, res, getProviderStatuses))
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
