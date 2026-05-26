import { Router } from 'express'
import { obtenerDetalleQR, obtenerQRLote } from '../controllers/qrsController.js'

const router = Router()

router.get('/lotes/:id', obtenerQRLote)
router.get('/scan/:token', obtenerDetalleQR)

export default router

