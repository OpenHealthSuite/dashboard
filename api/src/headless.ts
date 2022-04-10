// This is for headless operations
import { refreshTokens } from './providers/FitbitRequestProvider'
import { runMigrations } from './repositories/_migrationRunner'

// We have to duplicate migrations, we should pull migrations
// out fully to headless too but this will do
runMigrations('migrations').then(() => {
  refreshTokens().then(() => {
    setInterval(refreshTokens, 60 * 1000)
  })
})
