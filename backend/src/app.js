import express from 'express'
import cors from 'cors'
import apiRoutes from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(cors())
app.use(express.json())

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

app.use('/api', apiRoutes)
app.use(errorHandler)

export default app
