import express, { Request, Response, NextFunction, json } from 'express'
import cors from 'cors'
import CognitoExpress from 'cognito-express'
import { addProviderRoutes } from './providers/ProvidersHandler'
import { addFitbitHandlers } from './providers/FitbitRequestProvider'
import { addStepHandlers } from './handlers/stepsHandlers'
import { addCaloriesHandlers } from './handlers/caloriesHandlers'
import { addSleepHandlers } from './handlers/sleepHandlers'
import { addUserSettingHandlers } from './handlers/userSettingHandlers'

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

const cognitoExpress = new CognitoExpress({
  region: process.env.AWS_REGION ?? 'eu-west-2',
  cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: 'id',
  tokenExpiration: 3600000
})

app.use(authenticationMiddleware)

function authenticationMiddleware (req: Request, res: Response, next: NextFunction) {
  // TODO: We should actually double check all this is necessary.
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')

  if (req.method !== 'OPTIONS') {
    const accessTokenFromClient = req.headers.authorization
    if (!accessTokenFromClient) return res.status(401).send('Access Token missing from header')

    cognitoExpress.validate(accessTokenFromClient.replace('Bearer ', ''), function (err: any, response: any) {
      if (err) {
        return res.status(401).send(err)
      }
      res.locals.userId = response.sub
      return next()
    })
  }
}

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
