import { Request, Response, NextFunction } from 'express'

export async function authenticationMiddleware (req: Request, res: Response, next: NextFunction) {
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
  if (process.env.DEV_USER_ID) {
    res.locals.userId = process.env.DEV_USER_ID
  } else {
    // TODO: This is github specific right now
    res.locals.userId = req.header('x-auth-request-user')
  }
  next()
}
