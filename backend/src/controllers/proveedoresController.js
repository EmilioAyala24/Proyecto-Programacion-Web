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
