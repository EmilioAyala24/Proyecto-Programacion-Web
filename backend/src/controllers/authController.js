import * as usuariosModel from '../models/usuariosModel.js'
import { validarLogin } from '../validators/authValidator.js'
import { verificarPassword } from '../utils/password.js'

export async function login(req, res, next) {
  try {
    const validacion = validarLogin(req.body)

    if (!validacion.valido) {
      return res.status(400).json({
        mensaje: 'Datos de acceso inválidos.',
        errores: validacion.errores,
      })
    }

    const usuario = await usuariosModel.obtenerUsuarioPorUsername(validacion.datosLimpios.usuario)

    if (!usuario || !verificarPassword(validacion.datosLimpios.password, usuario.password_hash)) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' })
    }

    const conexion = await usuariosModel.registrarConexion(usuario.id_usuario)

    return res.json({
      data: {
        id: usuario.id_usuario,
        usuario: usuario.usuario,
        nombre: usuario.nombre,
        apPat: usuario.ap_pat,
        apMat: usuario.ap_mat,
        telefono: usuario.telefono,
        rol: usuario.rol,
        ultimaConexion: conexion?.ultima_conexion ?? null,
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
      return res.status(400).json({ mensaje: 'El usuario es requerido para cerrar sesión.' })
    }

    return res.json({
      mensaje: 'Sesión cerrada.',
      data: { id_usuario: idUsuario },
    })
  } catch (error) {
    return next(error)
  }
}
