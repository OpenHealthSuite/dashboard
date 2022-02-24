import { Request, Response } from 'express'

export async function userRestrictedHandler (req: Request, res: Response, next: (userId: string, req: Request, res: Response) => void) {
  const localUserId = res.locals.userId
  const userId = req.params.userId

  if (!!localUserId && !!userId && localUserId === userId) {
    return await next(userId, req, res)
  }
  res.sendStatus(403)
}
