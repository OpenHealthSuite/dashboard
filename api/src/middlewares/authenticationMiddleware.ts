import { Request, Response, NextFunction } from 'express'

export async function authenticationMiddleware (req: Request, res: Response, next: NextFunction, mdCognitoExpress: any) {
  // TODO: We should actually double check all this is necessary.
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate')

  if (req.method !== 'OPTIONS') {
    const accessTokenFromClient = req.headers.authorization
    if (!accessTokenFromClient) return res.status(401).send('Access Token missing from header')

    try {
      const response = await mdCognitoExpress.validate(accessTokenFromClient.replace('Bearer ', ''))
      res.locals.userId = response.sub
      next()
    } catch (e) {
      res.status(401).send(e)
    }
  }
}
