import { Router } from 'express'
import {
  actualizarLote,
  eliminarLote,
  listarLotes,
  registrarLote,
} from '../controllers/lotesController.js'

const router = Router()

router.get('/', listarLotes)
router.post('/', registrarLote)
router.put('/:id', actualizarLote)
router.delete('/:id', eliminarLote)

export default router
