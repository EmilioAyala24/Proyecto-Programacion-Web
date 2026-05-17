import * as ventasModel from '../models/ventasModel.js'
import { validarVenta } from '../validators/ventasValidator.js'

export async function listarVentas(_req, res, next) {
  try {
    const ventas = await ventasModel.obtenerVentas()
    res.json({
      data: ventas,
      total: ventas.length,
    })
  } catch (error) {
    next(error)
  }
}

export async function obtenerVenta(req, res, next) {
  try {
    const { id } = req.params

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: 'El ID de la venta es requerido y debe ser numérico',
      })
    }

    const detalle = await ventasModel.obtenerDetalleVenta(Number(id))

    if (detalle.length === 0) {
      return res.status(404).json({
        error: 'Venta no encontrada',
      })
    }

    res.json({ data: detalle })
  } catch (error) {
    next(error)
  }
}

export async function crearVenta(req, res, next) {
  try {
    const { id_usuario, id_metPag, id_cliente, detalles } = req.body

    // Validar datos
    const erroresValidacion = validarVenta({
      id_usuario,
      id_metPag,
      detalles,
    })

    if (erroresValidacion) {
      return res.status(400).json({
        error: 'Errores de validación',
        detalles: erroresValidacion,
      })
    }

    // Crear venta
    const venta = await ventasModel.crearVenta(
      id_usuario,
      id_metPag,
      id_cliente,
      detalles,
    )

    res.status(201).json({
      mensaje: 'Venta creada exitosamente',
      data: venta,
    })
  } catch (error) {
    next(error)
  }
}

export async function obtenerMetodosPago(_req, res, next) {
  try {
    console.log('Obteniendo métodos de pago...')
    const metodos = await ventasModel.obtenerMetodosPago()
    console.log('Métodos obtenidos:', metodos)
    res.json({ data: metodos })
  } catch (error) {
    console.error('Error en obtenerMetodosPago:', error)
    next(error)
  }
}

export async function obtenerClientes(_req, res, next) {
  try {
    const clientes = await ventasModel.obtenerClientes()
    res.json({ data: clientes })
  } catch (error) {
    next(error)
  }
}

export async function obtenerMedicamentosDisponibles(_req, res, next) {
  try {
    const medicamentos = await ventasModel.obtenerMedicamentosDisponibles()
    res.json({ data: medicamentos })
  } catch (error) {
    next(error)
  }
}
