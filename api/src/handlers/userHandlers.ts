import { Application, Request, Response } from 'express'

export function addUserHandlers (app: Application) {
  app.get('/api/whoami', whoamiFunction)
}

function whoamiFunction (req: Request, res: Response) {
  if (!res.locals.userId) {
    return res.status(401).send('Unauthorized')
  }
  res.send({
    userId: res.locals.userId
  })
}
