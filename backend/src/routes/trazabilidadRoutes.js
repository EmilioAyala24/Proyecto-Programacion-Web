import { Router } from 'express'
import { buscarCompradores } from '../controllers/trazabilidadController.js'

const router = Router()

router.get('/compradores', buscarCompradores)

export default router
