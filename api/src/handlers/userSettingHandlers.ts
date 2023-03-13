import { Application, Request, Response } from 'express'
import { UserSettingRepository } from '../repositories/userSettingsRepository'
import { userRestrictedHandler } from '../utilities/UserRestrictedHandler'
import { DashboardLocals } from '..'

const repository = new UserSettingRepository()

const SettingKeys = {
  Dashboard: 'dashboard'
}

export function addUserSettingHandlers (app: Application) {
  app.get('/api/users/:userId/userSettings/:settingId', (req, res: Response<any, DashboardLocals>) => userRestrictedHandler(req, res, settingsGet))
  app.put('/api/users/:userId/userSettings/:settingId', (req, res: Response<any, DashboardLocals>) => userRestrictedHandler(req, res, settingsUpdate))
}

const settingsGet = async (userId: string, req: Request, res: Response) => {
  const settingId = req.params.settingId
  if (!Object.values(SettingKeys).includes(settingId)) {
    return res.status(400).send({ error: `Setting "${settingId}" Not Found` })
  }

  const planRes = await repository.getSetting(userId, settingId)

  planRes.map(plan => plan ? res.send(plan.details) : res.status(404).send({ error: `No item for user ${userId} found under ${settingId}` }))
    .mapErr(() => res.status(500).send({ error: 'Internal Error' }))
}

const settingsUpdate = async (userId: string, req: Request, res: Response) => {
  const body: any = req.body
  const settingId = req.params.settingId

  if (!Object.values(SettingKeys).includes(settingId)) {
    return res.status(400).send({ error: `Setting "${settingId}" Not Found` })
  }

  (await repository.getSetting(userId, settingId))
    .map(async existing => {
      if (existing) {
        return (await repository.updateSetting(userId, settingId, body)).map(() => res.send({ msg: 'OK - Updated' }))
      }
      return (await repository.createSetting(userId, settingId, body)).map(() => res.send({ msg: 'OK - Created' }))
    })
    .mapErr(() => res.status(500).send({ error: 'Internal Error' }))
}
