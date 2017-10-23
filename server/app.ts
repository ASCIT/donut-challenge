import * as express from 'express'
import * as path from 'path'
import apiRouter from './api'

const app = express()

app.use('/api', apiRouter)
app.use(express.static(path.join(__dirname, '../public')))

export default app