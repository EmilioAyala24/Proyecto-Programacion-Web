import * as clientesModel from '../models/clientesModel.js'
import { validarCliente } from '../validators/clientesValidator.js'

export async function listarClientes(_req, res, next) {
  try {
    const clientes = await clientesModel.obtenerClientes()
    res.json({
      data: clientes,
      total: clientes.length,
    })
  } catch (error) {
    next(error)
  }
}

export async function obtenerCliente(req, res, next) {
  try {
    const { id } = req.params

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: 'El ID del cliente es requerido y debe ser numérico',
      })
    }

    const cliente = await clientesModel.obtenerClientePorId(Number(id))

    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
      })
    }

    res.json({ data: cliente })
  } catch (error) {
    next(error)
  }
}

export async function crearCliente(req, res, next) {
  try {
    const { nombre, ap_pat, ap_mat, telefono } = req.body

    const erroresValidacion = validarCliente({ nombre, ap_pat, ap_mat, telefono })

    if (Object.keys(erroresValidacion).length > 0) {
      return res.status(400).json({ errores: erroresValidacion })
    }

    const clienteCreado = await clientesModel.crearCliente(nombre, ap_pat, ap_mat, telefono)

    res.status(201).json({
      mensaje: 'Cliente creado exitosamente',
      data: clienteCreado,
    })
  } catch (error) {
    next(error)
  }
}

export async function actualizarCliente(req, res, next) {
  try {
    const { id } = req.params
    const { nombre, ap_pat, ap_mat, telefono } = req.body

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: 'El ID del cliente es requerido y debe ser numérico',
      })
    }

    const erroresValidacion = validarCliente({ nombre, ap_pat, ap_mat, telefono })

    if (Object.keys(erroresValidacion).length > 0) {
      return res.status(400).json({ errores: erroresValidacion })
    }

    const clienteActualizado = await clientesModel.actualizarCliente(
      Number(id),
      nombre,
      ap_pat,
      ap_mat,
      telefono,
    )

    if (!clienteActualizado) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
      })
    }

    res.json({
      mensaje: 'Cliente actualizado exitosamente',
      data: clienteActualizado,
    })
  } catch (error) {
    next(error)
  }
}

export async function eliminarClienteCtrl(req, res, next) {
  try {
    const { id } = req.params

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: 'El ID del cliente es requerido y debe ser numérico',
      })
    }

    const resultado = await clientesModel.eliminarCliente(Number(id))

    if (!resultado) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
      })
    }

    res.json({
      mensaje: 'Cliente eliminado exitosamente',
      data: resultado,
    })
  } catch (error) {
    next(error)
  }
}
