import * as lotesModel from '../models/lotesModel.js'

const LIMITE_LOTE = 60
const LIMITE_STOCK = 999999
const LIMITE_PRECIO = 99999999.99
const patronCodigoLote = /^[a-zA-Z0-9._-]+$/

export async function listarLotes(_req, res, next) {
  try {
    const lotes = await lotesModel.obtenerLotes()
    res.json(lotes)
  } catch (error) {
    next(error)
  }
}

function limpiarLote(datos) {
  return {
    idMedicamento: Number(datos.idMedicamento ?? datos.id_medicamento ?? 0),
    idProv: Number(datos.idProv ?? datos.id_prov),
    numeroLote: datos.numeroLote?.trim() ?? datos.numero_lote?.trim() ?? '',
    fechaFabricacion: datos.fechaFabricacion ?? datos.fecha_fabricacion ?? null,
    fechaCaducidad: datos.fechaCaducidad ?? datos.fecha_caducidad ?? null,
    fechaIngreso: datos.fechaIngreso ?? datos.fecha_ingreso ?? null,
    fechaCompra: datos.fechaCompra ?? datos.fecha_compra ?? null,
    stockActual: Number(datos.stockActual ?? datos.stockDisponible ?? datos.stock_actual ?? 0),
    precioCompra: Number(datos.precioCompra ?? datos.precio_compra ?? 0),
    precioVenta: Number(datos.precioVenta ?? datos.precio_venta ?? 0),
  }
}

function validarLote(datos) {
  const errores = {}

  if (!datos.idProv || Number.isNaN(datos.idProv)) {
    errores.idProv = 'Selecciona un proveedor.'
  }

  if (!datos.idMedicamento || Number.isNaN(datos.idMedicamento)) {
    errores.idMedicamento = 'Selecciona un medicamento.'
  }

  if (!datos.numeroLote || datos.numeroLote.length < 2) {
    errores.numeroLote = 'El numero de lote es obligatorio.'
  } else if (datos.numeroLote.length > LIMITE_LOTE) {
    errores.numeroLote = `El numero de lote no puede exceder ${LIMITE_LOTE} caracteres.`
  } else if (!patronCodigoLote.test(datos.numeroLote)) {
    errores.numeroLote = 'El numero de lote solo acepta letras, numeros, punto, guion o guion bajo.'
  }

  if (
    Number.isNaN(datos.stockActual) ||
    !Number.isInteger(datos.stockActual) ||
    datos.stockActual < 0 ||
    datos.stockActual > LIMITE_STOCK
  ) {
    errores.stockActual = `El stock debe ser un entero entre 0 y ${LIMITE_STOCK}.`
  }

  if (
    Number.isNaN(datos.precioCompra) ||
    datos.precioCompra < 0 ||
    datos.precioCompra > LIMITE_PRECIO ||
    !/^\d+(\.\d{1,2})?$/.test(String(datos.precioCompra))
  ) {
    errores.precioCompra = 'El precio de compra debe ser mayor o igual a cero y tener maximo 2 decimales.'
  }

  if (
    Number.isNaN(datos.precioVenta) ||
    datos.precioVenta < 0 ||
    datos.precioVenta > LIMITE_PRECIO ||
    !/^\d+(\.\d{1,2})?$/.test(String(datos.precioVenta))
  ) {
    errores.precioVenta = 'El precio de venta debe ser mayor o igual a cero y tener maximo 2 decimales.'
  }

  return errores
}

export async function registrarLote(req, res, next) {
  try {
    const datos = limpiarLote(req.body)
    const errores = validarLote(datos)

    if (Object.keys(errores).length > 0) {
      return res.status(400).json({ mensaje: 'Datos de lote invalidos.', errores })
    }

    const lote = await lotesModel.crearLote(datos)
    return res.status(201).json(lote)
  } catch (error) {
    return next(error)
  }
}

export async function actualizarLote(req, res, next) {
  try {
    const datos = limpiarLote(req.body)
    const errores = validarLote(datos)

    if (Object.keys(errores).length > 0) {
      return res.status(400).json({ mensaje: 'Datos de lote invalidos.', errores })
    }

    const lote = await lotesModel.actualizarLote(Number(req.params.id), datos)

    if (!lote) {
      return res.status(404).json({ mensaje: 'Lote no encontrado.' })
    }

    return res.json(lote)
  } catch (error) {
    return next(error)
  }
}

export async function eliminarLote(req, res, next) {
  try {
    const lote = await lotesModel.eliminarLote(Number(req.params.id))

    if (!lote) {
      return res.status(404).json({ mensaje: 'Lote no encontrado.' })
    }

    return res.json({ mensaje: 'Lote eliminado.' })
  } catch (error) {
    return next(error)
  }
}
