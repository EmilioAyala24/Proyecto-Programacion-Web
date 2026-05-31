import { Router } from 'express'
import {
  actualizarLote,
  eliminarLote,
  listarLotesOcultos,
  listarLotes,
  registrarLote,
  restaurarLote,
} from '../controllers/lotesController.js'

const router = Router()

router.get('/', listarLotes)
router.get('/ocultos', listarLotesOcultos)
router.post('/', registrarLote)
router.put('/:id', actualizarLote)
router.patch('/:id/restaurar', restaurarLote)
router.delete('/:id', eliminarLote)

export default router
