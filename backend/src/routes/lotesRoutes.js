import { Router } from 'express'
import {
  actualizarLote,
  eliminarLote,
  listarLotesOcultos,
  listarLotes,
  registrarLote,
} from '../controllers/lotesController.js'

const router = Router()

router.get('/', listarLotes)
router.get('/ocultos', listarLotesOcultos)
router.post('/', registrarLote)
router.put('/:id', actualizarLote)
router.delete('/:id', eliminarLote)

export default router
