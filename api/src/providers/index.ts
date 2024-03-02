import { fitbitDataProvider as fitbitProvider } from './Fitbit/FitbitStatProvider'
import { openFoodDiaryDataProvider as ofdProvider } from './OpenFoodDiary/OpenFoodDiaryProvider'
import { polarDataProvider as polarProvider } from './Polar/PolarDataProvider'

const ofdConfigured = process.env.OPEN_FOOD_DIARY_API && process.env.OPEN_FOOD_DIARY_API_HEADER

const fitbitConfigured = process.env.FITBIT_CLIENT_ID && process.env.FITBIT_CLIENT_SECRET

const polarConfigured = process.env.POLAR_CLIENT_ID && process.env.POLAR_CLIENT_SECRET

const openfooddiary = ofdConfigured ? ofdProvider : {}
const fitbit = fitbitConfigured ? fitbitProvider : {}
const polar = polarConfigured ? polarProvider : {}

export {
  fitbit,
  openfooddiary,
  polar
}
