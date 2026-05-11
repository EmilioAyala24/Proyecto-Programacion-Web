import { Router } from 'express'
import {
  listarProveedores,
  registrarProveedor,
} from '../controllers/proveedoresController.js'

const router = Router()

router.get('/', listarProveedores)
router.post('/', registrarProveedor)

export default router
