import { Router } from 'express'
import {
  actualizarMedicamento,
  eliminarMedicamento,
  listarMedicamentos,
  registrarMedicamento,
} from '../controllers/medicamentosController.js'

const router = Router()

router.get('/', listarMedicamentos)
router.post('/', registrarMedicamento)
router.put('/:id', actualizarMedicamento)
router.delete('/:id', eliminarMedicamento)

export default router
