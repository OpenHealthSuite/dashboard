import { Request, Response, NextFunction } from 'express'
import CognitoExpress from 'cognito-express'

const cognitoExpress = new CognitoExpress({
  region: process.env.AWS_REGION ?? 'eu-west-2',
  cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: 'id',
  tokenExpiration: 3600000
})

export function authenticationMiddleware (req: Request, res: Response, next: NextFunction) {
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
