import express from 'express'
import cors from 'cors'

const app = express()
const port = 3030

app.use(cors({
  origin: 'http://localhost:3000'
}))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Example app listening at http://localhost:${port}`)
})