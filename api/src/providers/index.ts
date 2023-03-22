import { fitbitDataProvider as fitbitProvider } from './Fitbit/FitbitStatProvider'
import { openFoodDiaryDataProvider as ofdProvider } from './OpenFoodDiary/OpenFoodDiaryProvider'

const ofdConfigured = process.env.OPEN_FOOD_DIARY_API && process.env.OPEN_FOOD_DIARY_API_HEADER

const fitbitConfigured = process.env.FITBIT_CLIENT_ID && process.env.FITBIT_CLIENT_SECRET

const openfooddiary = ofdConfigured ? ofdProvider : {}
const fitbit = fitbitConfigured ? fitbitProvider : {}
export {
  fitbit,
  openfooddiary
}
