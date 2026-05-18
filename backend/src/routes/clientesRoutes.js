import { Router } from 'express'
import {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarClienteCtrl,
} from '../controllers/clientesController.js'

const router = Router()

router.get('/', listarClientes)
router.get('/:id', obtenerCliente)
router.post('/', crearCliente)
router.put('/:id', actualizarCliente)
router.delete('/:id', eliminarClienteCtrl)

export default router
