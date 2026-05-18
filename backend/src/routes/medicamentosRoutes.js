import { Router } from 'express'
import {
  listarMedicamentos,
  registrarMedicamento,
} from '../controllers/medicamentosController.js'

const router = Router()

router.get('/', listarMedicamentos)
router.post('/', registrarMedicamento)

export default router
