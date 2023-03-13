import { Request, Response } from 'express'
import { DashboardLocals } from '..'

export async function userRestrictedHandler (req: Request, res: Response<any, DashboardLocals>, next: (userId: string, req: Request, res: Response<any, DashboardLocals>) => void) {
  const localUserId = res.locals.userId
  const userId = req.params.userId

  if (!!localUserId && !!userId && localUserId === userId) {
    return await next(userId, req, res)
  }
  res.sendStatus(403)
}
