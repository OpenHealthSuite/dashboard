import { Application, Request, Response } from 'express'
import { TrainingPlanRepository } from '../repositories/trainingPlanRepository'
import { TrainingPlanActivityRepository } from '../repositories/trainingPlanActivityRepository'

const trainingPlanRepository = new TrainingPlanRepository()
const trainingPlanActivityRepository = new TrainingPlanActivityRepository()

export function addTrainingPlanActivityHandlers (app: Application) {
  app.post('/trainingplans/:trainingPlanId/activities', activityCreate)
  app.get('/trainingplans/:trainingPlanId/activities', activityGetAll)
  app.get('/trainingplans/:trainingPlanId/activities/:activityId', activityGet)
  app.put('/trainingplans/:trainingPlanId/activities/:activityId', activityUpdate)
  app.delete('/trainingplans/:trainingPlanId/activities/:activityId', activityDelete)
}

export const activityCreate = async (req: Request, res: Response) => {
  const { trainingPlanId } = req.params
  const userId = res.locals.userId

  const existing = await trainingPlanRepository.getTrainingPlan(userId, trainingPlanId)

  if (!existing || existing.userId !== userId) {
    return res.status(404).send(`No item for user ${userId} found under ${trainingPlanId}`)
  }

  const body = JSON.parse(req.body)

  const newItem = await trainingPlanActivityRepository.createTrainingPlanActivity(trainingPlanId, body)

  return res.send(newItem)
}

export const activityDelete = async (req: Request, res: Response) => {
  const userId = res.locals.userId

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

export const activityGetAll = async (req: Request, res: Response) => {
  const userId = res.locals.userId

  const { trainingPlanId } = req.params

  const existing = await trainingPlanRepository.getTrainingPlan(userId, trainingPlanId)

  if (!existing || existing.userId !== userId) {
    return res.status(404).send(`No item for user ${userId} found under ${trainingPlanId}`)
  }

  const items = await trainingPlanActivityRepository.getTrainingPlanActivitiesForTrainingPlan(trainingPlanId)

  return res.send(items)
}

export const activityGet = async (req: Request, res: Response) => {
  const userId = res.locals.userId

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

export const activityUpdate = async (req: Request, res: Response) => {
  const userId = res.locals.userId

  const { trainingPlanId, activityId } = req.params

  const body = JSON.parse(req.body)
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
