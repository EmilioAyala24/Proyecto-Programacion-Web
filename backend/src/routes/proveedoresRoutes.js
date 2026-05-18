import { Router } from 'express'
import {
  actualizarProveedor,
  eliminarProveedor,
  listarProveedores,
  registrarProveedor,
} from '../controllers/proveedoresController.js'

const router = Router()

router.get('/', listarProveedores)
router.post('/', registrarProveedor)
router.put('/:id', actualizarProveedor)
router.delete('/:id', eliminarProveedor)

export default router
