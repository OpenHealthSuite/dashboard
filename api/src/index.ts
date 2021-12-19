import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { addTrainingPlanActivityHandlers } from './handlers/trainingPlanActivityHandlers'
import { addTrainingPlanHandlers } from './handlers/trainingPlanHandlers'
import CognitoExpress from 'cognito-express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const configuration = {
  port: 8080,
  host: 'localhost'
}

app.use(cors())

const cognitoExpress = new CognitoExpress({
  region: process.env.AWS_REGION ?? 'eu-west-1',
  cognitoUserPoolId: process.env.COGNITO_USER_POOL,
  tokenUse: 'access',
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

    cognitoExpress.validate(accessTokenFromClient, function (err: any, response: any) {
      if (err) {
        return res.status(401).send(err)
      }
      res.locals.userId = response.sub
      next()
    })
  }
}

if (process.env.RUNNING_IN_CONTAINER) {
  configuration.host = '0.0.0.0' // Mapping to container host
}

// define a route handler for the default home page
app.get('/', (req, res) => {
  res.send('Hello world from PaceMe!')
})

// Add our Handlers
addTrainingPlanHandlers(app)
addTrainingPlanActivityHandlers(app)

// start the Express server
app.listen(configuration.port, configuration.host, () => {
  console.log(`server started at ${configuration.host}:${configuration.port}`)
})
