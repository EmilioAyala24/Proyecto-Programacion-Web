import * as ventasModel from '../models/ventasModel.js'
import * as usuariosModel from '../models/usuariosModel.js'
import { validarVenta } from '../validators/ventasValidator.js'
import { verificarPassword } from '../utils/password.js'

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

export async function obtenerTicketPublico(req, res, next) {
  try {
    const { id } = req.params

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: 'El ID de la venta es requerido y debe ser numerico',
      })
    }

    const venta = await ventasModel.obtenerVentaPorId(Number(id))

    if (!venta) {
      return res.status(404).json({
        error: 'Venta no encontrada',
      })
    }

    const detalles = await ventasModel.obtenerDetalleVenta(Number(id))

    res.json({
      data: {
        venta,
        detalles,
      },
    })
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

export async function eliminarVenta(req, res, next) {
  try {
    const idVenta = Number(req.params.id)
    const adminUsuario = String(req.body?.adminUsuario ?? req.body?.admin_usuario ?? '').trim()
    const adminPassword = String(req.body?.adminPassword ?? req.body?.admin_password ?? '').trim()

    if (!idVenta || Number.isNaN(idVenta)) {
      return res.status(400).json({ mensaje: 'El ID de la venta debe ser válido.' })
    }

    if (!adminUsuario || !adminPassword) {
      return res.status(400).json({
        mensaje: 'Captura el usuario y la contraseña de un administrador para eliminar la venta.',
      })
    }

    const administrador = await usuariosModel.obtenerUsuarioPorUsername(adminUsuario)

    if (
      !administrador ||
      String(administrador.rol).toLowerCase() !== 'admin' ||
      !verificarPassword(adminPassword, administrador.password_hash)
    ) {
      return res.status(401).json({
        mensaje: 'Autorización de administrador incorrecta.',
      })
    }

    const venta = await ventasModel.eliminarVenta(idVenta)

    if (!venta) {
      return res.status(404).json({ mensaje: 'Venta no encontrada.' })
    }

    return res.json({ mensaje: 'Venta eliminada y stock restaurado.' })
  } catch (error) {
    return next(error)
  }
}
