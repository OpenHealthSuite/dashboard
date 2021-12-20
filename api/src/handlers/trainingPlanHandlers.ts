import { Application, Request, Response } from 'express'
import { ITrainingPlan, TrainingPlanRepository } from '../repositories/trainingPlanRepository'

const repository = new TrainingPlanRepository()

export function addTrainingPlanHandlers (app: Application) {
  app.post('/trainingplans', planCreate)
  app.get('/trainingplans', planGetAll)
  app.get('/trainingplans/:trainingPlanId', planGet)
  app.put('/trainingplans/:trainingPlanId', planUpdate)
  app.delete('/trainingplans/:trainingPlanId', planDelete)
}

const planCreate = async (req: Request, res: Response) => {
  const userId = res.locals.userId
  const body: ITrainingPlan = req.body

  const newItem = await repository.createTrainingPlan(userId, body)

  return res.send(newItem)
}

export const planDelete = async (req: Request, res: Response) => {
  const userId = res.locals.userId

  const id = req.params.trainingPlanId

  const existing = await repository.getTrainingPlan(userId, id)

  if (!existing || existing.userId !== userId) {
    return res.status(404).send(`No item for user ${userId} found under ${id}`)
  }

  await repository.deleteTrainingPlan(userId, id)
  // TODO: need to delete associated activities too.

  res.sendStatus(200)
}

export const planGetAll = async (req: Request, res: Response) => {
  const userId = res.locals.userId

  const items = await repository.getTrainingPlansForUser(userId)

  return res.send(items)
}

export const planGet = async (req: Request, res: Response) => {
  const userId = res.locals.userId

  const id = req.params.trainingPlanId

  const plan = await repository.getTrainingPlan(userId, id)

  if (!plan || plan.userId !== userId) {
    return res.status(404).send(`No item for user ${userId} found under ${id}`)
  }

  return res.send(plan)
}

export const planUpdate = async (req: Request, res: Response) => {
  const userId = res.locals.userId

  const body: ITrainingPlan = req.body
  const id = req.params.trainingPlanId
  const { name, active } = body

  const existing = await repository.getTrainingPlan(userId, id)

  if (!existing || existing.userId !== userId) {
    return res.status(404).send(`No item for user ${userId} found under ${id}`)
  }

  const itemUpdate = {
    id: id,
    userId: userId,
    name: name,
    active: active
  }

  await repository.updateTrainingPlan(itemUpdate)

  return res.send(itemUpdate)
}
