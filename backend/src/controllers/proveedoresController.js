import * as proveedoresModel from '../models/proveedoresModel.js'
import { validarProveedor } from '../validators/proveedoresValidator.js'

export async function listarProveedores(_req, res, next) {
  try {
    const proveedores = await proveedoresModel.obtenerProveedores()
    res.json(proveedores)
  } catch (error) {
    next(error)
  }
}

export async function registrarProveedor(req, res, next) {
  try {
    const validacion = validarProveedor(req.body)

    if (!validacion.valido) {
      return res.status(400).json({
        mensaje: 'Datos de proveedor invalidos.',
        errores: validacion.errores,
      })
    }

    const proveedor = await proveedoresModel.crearProveedor(validacion.datosLimpios)
    return res.status(201).json(proveedor)
  } catch (error) {
    return next(error)
  }
}

export async function actualizarProveedor(req, res, next) {
  try {
    const validacion = validarProveedor(req.body)

    if (!validacion.valido) {
      return res.status(400).json({
        mensaje: 'Datos de proveedor invalidos.',
        errores: validacion.errores,
      })
    }

    const proveedor = await proveedoresModel.actualizarProveedor(
      Number(req.params.id),
      validacion.datosLimpios,
    )

    if (!proveedor) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado.' })
    }

    return res.json(proveedor)
  } catch (error) {
    return next(error)
  }
}

export async function eliminarProveedor(req, res, next) {
  try {
    const proveedor = await proveedoresModel.eliminarProveedor(Number(req.params.id))

    if (!proveedor) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado.' })
    }

    return res.json({ mensaje: 'Proveedor eliminado.' })
  } catch (error) {
    return next(error)
  }
}
