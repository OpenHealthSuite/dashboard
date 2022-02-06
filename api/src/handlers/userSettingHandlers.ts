import { Application, Request, Response } from 'express'
import { UserSettingRepository } from '../repositories/userSettingsRepository'
import { userRestrictedHandler } from '../utilities/UserRestrictedHandler'

const repository = new UserSettingRepository()

const SettingKeys = {
  Dashboard: 'dashboard'
}

export function addUserSettingHandlers (app: Application) {
  app.get('/users/:userId/userSettings/:settingId', (req, res) => userRestrictedHandler(req, res, settingsGet))
  app.put('/users/:userId/userSettings/:settingId', (req, res) => userRestrictedHandler(req, res, settingsUpdate))
}

const settingsGet = async (userId: string, req: Request, res: Response) => {
  const settingId = req.params.settingId

  if (Object.values(SettingKeys).includes(settingId)) {
    return res.status(400).send(`Setting "${settingId}" Not Found`)
  }

  const plan = await repository.getSetting(userId, settingId)

  if (!plan || plan.userId !== userId) {
    return res.status(404).send(`No item for user ${userId} found under ${settingId}`)
  }

  return res.send(plan.details)
}

const settingsUpdate = async (userId: string, req: Request, res: Response) => {
  const body: any = req.body
  const settingId = req.params.settingId

  if (Object.values(SettingKeys).includes(settingId)) {
    return res.status(400).send(`Setting "${settingId}" Not Found`)
  }

  await repository.updateSetting(userId, settingId, body)

  return res.send('OK')
}
