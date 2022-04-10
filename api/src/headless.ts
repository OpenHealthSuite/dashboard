// This is for headless operations
import { refreshTokens } from './providers/FitbitRequestProvider'

refreshTokens().then(() => {
  setInterval(refreshTokens, 60 * 1000)
})
