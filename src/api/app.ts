import express from 'express'
import cors from 'cors'
import CognitoMiddleware, { TokenUse } from './services/cognitoMiddleware'

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
})

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Example app listening at http://localhost:${port}`)
})