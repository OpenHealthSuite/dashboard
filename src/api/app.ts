import express from 'express'
import cors from 'cors'
import CognitoMiddleware, { TokenUse } from './services/cognitoMiddleware'
import * as trainingPlanService from './services/trainingPlanService'

const app = express()
const port = 3030
const cognitoMiddleware = new CognitoMiddleware({
  region: "us-east-1",
  cognitoUserPoolId: "us-east-1_ecXTzrIg3",
  tokenUse: TokenUse.id
});

app.use(cors({
  origin: 'http://localhost:3000'
}))

app.use((req, res, next) => cognitoMiddleware.cognitoMiddleware(req, res, next))

app.get('/', (req, res) => {
  res.send(`Hello ${res.locals.claims.email} (${res.locals.claims.sub})!`)
});

// TODO: Look into structuring this
// TODO: Also need validation on all this - incl error codes

app.get('/trainingplans', (req, res) => {
  res.send(JSON.stringify(trainingPlanService.getTrainingPlansForUser(res.locals.claims.sub)))
})

app.post('/trainingplans', (req, res) => {
  res.send(JSON.stringify(trainingPlanService.createTrainingPlanForUser(res.locals.claims.sub, req.body)))
})

app.get('/trainingplans/:trainingPlanId', (req, res) => {
  res.send(JSON.stringify(trainingPlanService.getTrainingPlansForUserById(res.locals.claims.sub, req.params.trainingPlanId)))
})

app.put('/trainingplans/:trainingPlanId', (req, res) => {
  trainingPlanService.updateTrainingPlansForUserById(res.locals.claims.sub, req.params.trainingPlanId, req.body)
  res.sendStatus(200)
})

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Example app listening at http://localhost:${port}`)
})