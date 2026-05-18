import { Router } from 'express'
import {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuarioCtrl,
} from '../controllers/usuariosController.js'

const router = Router()

router.get('/', listarUsuarios)
router.get('/:id', obtenerUsuario)
router.post('/', crearUsuario)
router.put('/:id', actualizarUsuario)
router.delete('/:id', eliminarUsuarioCtrl)

export default router
