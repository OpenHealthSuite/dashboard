import express, { json } from 'express'
import cors from 'cors'
import { addProviderRoutes } from './providers/ProvidersHandler'
import { addFitbitHandlers } from './providers/FitbitRequestProvider'
import { addStepHandlers } from './handlers/stepsHandlers'
import { addCaloriesHandlers } from './handlers/caloriesHandlers'
import { addSleepHandlers } from './handlers/sleepHandlers'
import { addUserSettingHandlers } from './handlers/userSettingHandlers'
import { authenticationMiddleware } from './middlewares/authenticationMiddleware'

const app = express()
const configuration = {
  port: 8080,
  host: 'localhost'
}

app.use(cors())
app.use(json())

// Public route for letsencrypt resolution
app.get('/', (req, res) => {
  res.send('Hello world from PaceMe!')
})

app.use(authenticationMiddleware)

if (process.env.RUNNING_IN_CONTAINER) {
  configuration.host = '0.0.0.0' // Mapping to container host
}

// Add our Handlers
addUserSettingHandlers(app)
addProviderRoutes(app)
addFitbitHandlers(app)
addSleepHandlers(app)
addStepHandlers(app)
addCaloriesHandlers(app)

// start the Express server
app.listen(configuration.port, configuration.host, () => {
  console.log(`server started at ${configuration.host}:${configuration.port}`)
})
