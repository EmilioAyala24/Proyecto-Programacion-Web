import { Router } from 'express'
import { listarLotes } from '../controllers/lotesController.js'

const router = Router()

router.get('/', listarLotes)

export default router
