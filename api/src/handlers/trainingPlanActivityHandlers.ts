import { Application, Request, Response } from 'express'
import { TrainingPlanRepository } from '../repositories/trainingPlanRepository'
import { ITrainingPlanActivity, TrainingPlanActivityRepository } from '../repositories/trainingPlanActivityRepository'
import { userRestrictedHandler } from '../utilities/UserRestrictedHandler'

const trainingPlanRepository = new TrainingPlanRepository()
const trainingPlanActivityRepository = new TrainingPlanActivityRepository()

export function addTrainingPlanActivityHandlers (app: Application) {
  app.post('/users/:userId/trainingplans/:trainingPlanId/activities', (req, res) => userRestrictedHandler(req, res, activityCreate))
  app.get('/users/:userId/trainingplans/:trainingPlanId/activities', (req, res) => userRestrictedHandler(req, res, activityGetAll))
  app.get('/users/:userId/trainingplans/:trainingPlanId/activities/:activityId', (req, res) => userRestrictedHandler(req, res, activityGet))
  app.put('/users/:userId/trainingplans/:trainingPlanId/activities/:activityId', (req, res) => userRestrictedHandler(req, res, activityUpdate))
  app.delete('/users/:userId/trainingplans/:trainingPlanId/activities/:activityId', (req, res) => userRestrictedHandler(req, res, activityDelete))
}

const activityCreate = async (userId: string, req: Request, res: Response) => {
  const { trainingPlanId } = req.params

  const existing = await trainingPlanRepository.getTrainingPlan(userId, trainingPlanId)

  if (!existing || existing.userId !== userId) {
    return res.status(404).send(`No item for user ${userId} found under ${trainingPlanId}`)
  }

  const body: ITrainingPlanActivity = req.body

  const newItem = await trainingPlanActivityRepository.createTrainingPlanActivity(trainingPlanId, body)

  return res.send(newItem)
}

const activityDelete = async (userId: string, req: Request, res: Response) => {
  const { trainingPlanId, activityId } = req.params

  const existing = await trainingPlanRepository.getTrainingPlan(userId, trainingPlanId)

  if (!existing || existing.userId !== userId) {
    return res.status(404).send(`No item for user ${userId} found under ${trainingPlanId}`)
  }

  const existingActivity = await trainingPlanActivityRepository.getTrainingPlanActivity(trainingPlanId, activityId)

  if (!existingActivity || existingActivity.trainingPlanId !== trainingPlanId) {
    return res.status(404).send(`No item for user ${activityId} found under ${trainingPlanId}`)
  }

  await trainingPlanActivityRepository.deleteTrainingPlanActivity(trainingPlanId, activityId)

  return res.sendStatus(200)
}

const activityGetAll = async (userId: string, req: Request, res: Response) => {
  const { trainingPlanId } = req.params

  const existing = await trainingPlanRepository.getTrainingPlan(userId, trainingPlanId)

  if (!existing || existing.userId !== userId) {
    return res.status(404).send(`No item for user ${userId} found under ${trainingPlanId}`)
  }

  const items = await trainingPlanActivityRepository.getTrainingPlanActivitiesForTrainingPlan(trainingPlanId)

  return res.send(items)
}

const activityGet = async (userId: string, req: Request, res: Response) => {
  const { trainingPlanId, activityId } = req.params

  const existing = await trainingPlanRepository.getTrainingPlan(userId, trainingPlanId)

  if (!existing || existing.userId !== userId) {
    return res.status(404).send(`No item for user ${userId} found under ${trainingPlanId}`)
  }

  const activity = await trainingPlanActivityRepository.getTrainingPlanActivity(trainingPlanId, activityId)

  if (!activity || activity.trainingPlanId !== trainingPlanId) {
    return res.status(404).send(`No item for ${activityId} found under ${trainingPlanId}`)
  }

  return res.send(activity)
}

const activityUpdate = async (userId: string, req: Request, res: Response) => {
  const { trainingPlanId, activityId } = req.params

  const body: ITrainingPlanActivity = req.body
  const { name, activityTime, segments, complete } = body

  const existing = await trainingPlanRepository.getTrainingPlan(userId, trainingPlanId)

  if (!existing || existing.userId !== userId) {
    return res.status(404).send(`No item for user ${userId} found under ${trainingPlanId}`)
  }

  const existingActivity = await trainingPlanActivityRepository.getTrainingPlanActivity(trainingPlanId, activityId)

  if (!existingActivity || existingActivity.trainingPlanId !== trainingPlanId) {
    return res.status(404).send(`No item for ${activityId} found under ${trainingPlanId}`)
  }

  const itemUpdate = {
    id: activityId,
    trainingPlanId: trainingPlanId,
    name: name,
    activityTime: activityTime,
    segments: segments,
    complete: complete
  }

  await trainingPlanActivityRepository.updateTrainingPlanActivity(itemUpdate)

  return res.send(itemUpdate)
}
