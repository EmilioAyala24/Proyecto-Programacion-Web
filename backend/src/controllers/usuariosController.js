import * as usuariosModel from '../models/usuariosModel.js'
import { validarUsuario } from '../validators/usuariosValidator.js'

export async function listarUsuarios(_req, res, next) {
  try {
    const usuarios = await usuariosModel.obtenerUsuarios()
    res.json({
      data: usuarios,
      total: usuarios.length,
    })
  } catch (error) {
    next(error)
  }
}

export async function obtenerUsuario(req, res, next) {
  try {
    const { id } = req.params

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: 'El ID del usuario es requerido y debe ser numérico',
      })
    }

    const usuario = await usuariosModel.obtenerUsuarioPorId(Number(id))

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      })
    }

    res.json({ data: usuario })
  } catch (error) {
    next(error)
  }
}

export async function crearUsuario(req, res, next) {
  try {
    const { usuario, rol, nombre, ap_pat, ap_mat, telefono } = req.body

    const erroresValidacion = validarUsuario({
      usuario,
      rol,
      nombre,
      ap_pat,
      ap_mat,
      telefono,
    })

    if (Object.keys(erroresValidacion).length > 0) {
      return res.status(400).json({ errores: erroresValidacion })
    }

    const usuarioCreado = await usuariosModel.crearUsuario(
      usuario,
      rol,
      nombre,
      ap_pat,
      ap_mat,
      telefono,
    )

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      data: usuarioCreado,
    })
  } catch (error) {
    next(error)
  }
}

export async function actualizarUsuario(req, res, next) {
  try {
    const { id } = req.params
    const { usuario, rol, nombre, ap_pat, ap_mat, telefono } = req.body

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: 'El ID del usuario es requerido y debe ser numérico',
      })
    }

    const erroresValidacion = validarUsuario({
      usuario,
      rol,
      nombre,
      ap_pat,
      ap_mat,
      telefono,
    })

    if (Object.keys(erroresValidacion).length > 0) {
      return res.status(400).json({ errores: erroresValidacion })
    }

    const usuarioActualizado = await usuariosModel.actualizarUsuario(
      Number(id),
      usuario,
      rol,
      nombre,
      ap_pat,
      ap_mat,
      telefono,
    )

    if (!usuarioActualizado) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      })
    }

    res.json({
      mensaje: 'Usuario actualizado exitosamente',
      data: usuarioActualizado,
    })
  } catch (error) {
    next(error)
  }
}

export async function eliminarUsuarioCtrl(req, res, next) {
  try {
    const { id } = req.params

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: 'El ID del usuario es requerido y debe ser numérico',
      })
    }

    const resultado = await usuariosModel.eliminarUsuario(Number(id))

    if (!resultado) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      })
    }

    res.json({
      mensaje: 'Usuario eliminado exitosamente',
      data: resultado,
    })
  } catch (error) {
    next(error)
  }
}
