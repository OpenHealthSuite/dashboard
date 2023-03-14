import { Request, Response, NextFunction } from 'express'
import { fitbitDataProvider } from '../providers'
import { DataProvider } from '../providers/types'

export type DataProviderLocals = {
  dataProvider: DataProvider;
};

export async function dataProviderMiddleware (
  req: Request,
  res: Response,
  next: NextFunction
) {
  // TODO: This is where we setup data provider configuration
  // TODO: It needs this lump of logic IF it's using fitbit
  // TODO: This needs a test
  // if (!getFitbitToken(userId)) {
  //     return res.status(400).send({ status: 'No FitBit Token' })
  //   }

  res.locals.dataProvider = fitbitDataProvider
  next()
}
