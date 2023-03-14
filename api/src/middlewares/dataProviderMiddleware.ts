import { Request, Response, NextFunction } from 'express'
import { DashboardLocals } from '..'
import { fitbitDataProvider } from '../providers'
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
  tokenRetreivers = { fitbit: getFitbitToken }
) {
  // TODO: This is where we setup data provider configuration
  const settings = await userSettingsRepository.getSetting<UserProviderSettings>(res.locals.userId, 'provider_settings')
  if (Object.values(settings).includes('fitbit')) {
    if (!await tokenRetreivers.fitbit(res.locals.userId)) {
      return res.status(400).send({ status: 'No FitBit Token' })
    }
  }
  res.locals.dataProvider = fitbitDataProvider
  next()
}
