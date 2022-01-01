import { Application, Request, Response } from 'express'
import { ITrainingPlan, TrainingPlanRepository } from '../repositories/trainingPlanRepository'
import { userRestrictedHandler } from '../utilities/UserRestrictedHandler'

const repository = new TrainingPlanRepository()

export function addTrainingPlanHandlers (app: Application) {
  app.post('/users/:userId/trainingplans', (req, res) => userRestrictedHandler(req, res, planCreate))
  app.get('/users/:userId/trainingplans', (req, res) => userRestrictedHandler(req, res, planGetAll))
  app.get('/users/:userId/trainingplans/:trainingPlanId', (req, res) => userRestrictedHandler(req, res, planGet))
  app.put('/users/:userId/trainingplans/:trainingPlanId', (req, res) => userRestrictedHandler(req, res, planUpdate))
  app.delete('/users/:userId/trainingplans/:trainingPlanId', (req, res) => userRestrictedHandler(req, res, planDelete))
}

const planCreate = async (userId: string, req: Request, res: Response) => {
  const body: ITrainingPlan = req.body

  const newItem = await repository.createTrainingPlan(userId, body)

  return res.send(newItem)
}

const planDelete = async (userId: string, req: Request, res: Response) => {
  const id = req.params.trainingPlanId

  const existing = await repository.getTrainingPlan(userId, id)

  if (!existing || existing.userId !== userId) {
    return res.status(404).send(`No item for user ${userId} found under ${id}`)
  }

  await repository.deleteTrainingPlan(userId, id)
  // TODO: need to delete associated activities too.

  res.sendStatus(200)
}

const planGetAll = async (userId: string, req: Request, res: Response) => {
  const items = await repository.getTrainingPlansForUser(userId)

  return res.send(items)
}

const planGet = async (userId: string, req: Request, res: Response) => {
  const id = req.params.trainingPlanId

  const plan = await repository.getTrainingPlan(userId, id)

  if (!plan || plan.userId !== userId) {
    return res.status(404).send(`No item for user ${userId} found under ${id}`)
  }

  return res.send(plan)
}

const planUpdate = async (userId: string, req: Request, res: Response) => {
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
