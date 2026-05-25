import * as usuariosModel from '../models/usuariosModel.js'
import { validarLogin } from '../validators/authValidator.js'
import { verificarPassword } from '../utils/password.js'

export async function login(req, res, next) {
  try {
    const validacion = validarLogin(req.body)

    if (!validacion.valido) {
      return res.status(400).json({
        mensaje: 'Datos de acceso invalidos.',
        errores: validacion.errores,
      })
    }

    const usuario = await usuariosModel.obtenerUsuarioPorUsername(validacion.datosLimpios.usuario)

    if (!usuario || !verificarPassword(validacion.datosLimpios.password, usuario.password_hash)) {
      return res.status(401).json({ mensaje: 'Usuario o contrasena incorrectos.' })
    }

    return res.json({
      data: {
        id: usuario.id_usuario,
        usuario: usuario.usuario,
        nombre: usuario.nombre,
        apPat: usuario.ap_pat,
        apMat: usuario.ap_mat,
        telefono: usuario.telefono,
        rol: usuario.rol,
      },
    })
  } catch (error) {
    return next(error)
  }
}

export async function logout(req, res, next) {
  try {
    const idUsuario = Number(req.body?.id ?? req.body?.id_usuario)

    if (!idUsuario || Number.isNaN(idUsuario)) {
      return res.status(400).json({ mensaje: 'El usuario es requerido para cerrar sesion.' })
    }

    const conexion = await usuariosModel.registrarConexion(idUsuario)

    return res.json({
      mensaje: 'Sesion cerrada.',
      data: conexion,
    })
  } catch (error) {
    return next(error)
  }
}
