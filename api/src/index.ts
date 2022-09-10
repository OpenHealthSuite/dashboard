import express, { json } from 'express'
import cors from 'cors'
import { addProviderRoutes } from './providers/ProvidersHandler'
import { addFitbitHandlers } from './providers/FitbitRequestProvider'
import { addStepHandlers } from './handlers/stepsHandlers'
import { addCaloriesHandlers } from './handlers/caloriesHandlers'
import { addSleepHandlers } from './handlers/sleepHandlers'
import { addUserSettingHandlers } from './handlers/userSettingHandlers'
import { authenticationMiddleware } from './middlewares/authenticationMiddleware'
import { runMigrations } from './repositories/_migrationRunner'
import { addUserHandlers } from './handlers/userHandlers'
import path from 'path'

const app = express()
const configuration = {
  port: 8080
}

app.use(cors())
app.use(json())

app.use(express.static('./static'))

app.use((req, res, next) => authenticationMiddleware(req, res, next))

// Add our Handlers
addUserHandlers(app)
addUserSettingHandlers(app)
addProviderRoutes(app)
addFitbitHandlers(app)
addSleepHandlers(app)
addStepHandlers(app)
addCaloriesHandlers(app)

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../static/index.html'))
})

// start the Express server
// This assumes the node start script is used, which is fine, but it you have issues, look there.
runMigrations('migrations').then(() => app.listen(configuration.port, () => {
  console.log(`server started on port ${configuration.port}`)
}))
