import { fitbitDataProvider as fitbit } from './Fitbit/FitbitStatProvider'
import { openFoodDiaryDataProvider as ofdProvider } from './OpenFoodDiary/OpenFoodDiaryProvider'

const ofdConfigured = process.env.OPEN_FOOD_DIARY_API && process.env.OPEN_FOOD_DIARY_API_HEADER

const openfooddiary = ofdConfigured ? ofdProvider : undefined
export {
  fitbit,
  openfooddiary
}
