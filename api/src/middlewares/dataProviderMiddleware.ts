import { Request, Response, NextFunction } from 'express'
import { DashboardLocals } from '..'
import * as allProviders from '../providers'
import { getFitbitToken } from '../providers/Fitbit/FitbitRequestProvider'
import { DataProvider } from '../providers/types'
import { UserProviderSettings, UserSettingRepository } from '../repositories/userSettingsRepository'

const dataUserSettingsRepository = new UserSettingRepository()

export type DataProviderLocals = {
  dataProvider: DataProvider;
};

export async function dataProviderMiddleware (
  req: Request,
  res: Response<any, DashboardLocals>,
  next: NextFunction,
  userSettingsRepository = dataUserSettingsRepository,
  tokenRetreivers = { fitbit: getFitbitToken },
  providers = allProviders
) {
  // TODO: This is where we setup data provider configuration
  const settingsRes = await userSettingsRepository.getSetting<UserProviderSettings>(res.locals.userId, 'provider_settings')
  if (settingsRes.isErr()) {
    return res.sendStatus(500).send()
  }
  const settings = settingsRes.value?.details ?? {}
  if (Object.values(settings).includes('fitbit')) {
    if (!await tokenRetreivers.fitbit(res.locals.userId)) {
      return res.status(400).send({ status: 'No FitBit Token' })
    }
  }
  res.locals.dataProvider = Object.entries(settings)
    .reduce<DataProvider>((acc, [functionName, providerName]) => {
      // This is some gnarly typescript, makes more sense without it
      if (providers[providerName] !== undefined) {
        // @ts-ignore
        acc[functionName] = providers[providerName][functionName]
      }
      return acc
    }, {})
  next()
}
