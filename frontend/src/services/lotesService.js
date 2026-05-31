import { lotesIniciales } from '../data/lotes'

const API_URL = import.meta.env.VITE_API_URL

function obtenerEstadoPorCaducidad(fechaCaducidad) {
  if (!fechaCaducidad) {
    return 'Vigente'
  }

  const hoy = new Date()
  const caducidad = new Date(`${fechaCaducidad}T00:00:00`)
  const diferenciaDias = Math.ceil((caducidad - hoy) / (1000 * 60 * 60 * 24))

  if (diferenciaDias < 0) {
    return 'Caducado'
  }

  if (diferenciaDias <= 60) {
    return 'Proximo'
  }

  return 'Vigente'
}

function normalizarFecha(fecha) {
  return fecha ? String(fecha).split('T')[0] : ''
}

function normalizarLote(lote) {
  const fechaCaducidad = lote.fechaCaducidad ?? lote.fecha_caducidad
  const fechaIngreso = lote.fechaIngreso ?? lote.fecha_ingreso ?? ''

  return {
    id: lote.id ?? lote.id_lote,
    idMedicamento: lote.idMedicamento ?? lote.id_med,
    idProveedor: lote.idProveedor ?? lote.id_prov,
    codigo: lote.codigo ?? lote.codigo_lote,
    medicamento: lote.medicamento ?? lote.nombre_medicamento ?? '',
    proveedor: lote.proveedor ?? lote.nombre_proveedor ?? '',
    oculto: Boolean(lote.oculto),
    motivoOculto: lote.motivoOculto ?? lote.motivo_oculto ?? '',
    fechaOculto: normalizarFecha(lote.fechaOculto ?? lote.fecha_oculto),
    stockDisponible: Number(lote.stockDisponible ?? lote.stock_disponible ?? 0),
    precioCompra: Number(lote.precioCompra ?? lote.precio_compra ?? 0),
    precioVenta: Number(lote.precioVenta ?? lote.precio_venta ?? 0),
    fechaFabricacion: normalizarFecha(lote.fechaFabricacion ?? lote.fecha_fabricacion),
    fechaIngreso: normalizarFecha(fechaIngreso),
    fechaCaducidad: normalizarFecha(fechaCaducidad),
    estado: lote.estado ?? obtenerEstadoPorCaducidad(fechaCaducidad),
  }
}

export async function obtenerLotes() {
  if (!API_URL) {
    return lotesIniciales.map(normalizarLote)
  }

  const respuesta = await fetch(`${API_URL}/lotes`)

  if (!respuesta.ok) {
    throw new Error('No fue posible obtener los lotes.')
  }

  const datos = await respuesta.json()
  return datos.map(normalizarLote)
}

export async function obtenerLotesOcultos() {
  if (!API_URL) {
    return lotesIniciales.map(normalizarLote).filter((lote) => lote.oculto)
  }

  const respuesta = await fetch(`${API_URL}/lotes/ocultos`)

  if (!respuesta.ok) {
    throw new Error('No fue posible obtener los lotes ocultos.')
  }

  const datos = await respuesta.json()
  return datos.map(normalizarLote)
}

function serializarLote(lote) {
  return {
    idProv: Number(lote.idProveedor),
    idMedicamento: lote.idMedicamento ? Number(lote.idMedicamento) : null,
    numeroLote: lote.codigo,
    fechaFabricacion: lote.fechaFabricacion || null,
    fechaCaducidad: lote.fechaCaducidad || null,
    fechaIngreso: lote.fechaIngreso || null,
    fechaCompra: lote.fechaIngreso || null,
    stockActual: Number(lote.stockDisponible),
    precioCompra: Number(lote.precioCompra || 0),
    precioVenta: Number(lote.precioVenta || 0),
  }
}

export async function crearLote(lote) {
  if (!API_URL) {
    return normalizarLote({
      ...lote,
      id: Date.now(),
      proveedor: lote.proveedor ?? '',
    })
  }

  const respuesta = await fetch(`${API_URL}/lotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serializarLote(lote)),
  })

  if (!respuesta.ok) {
    throw new Error('No fue posible registrar el lote.')
  }

  const datos = await respuesta.json()
  return normalizarLote(datos)
}

export async function actualizarLote(id, lote) {
  if (!API_URL) {
    return normalizarLote({ ...lote, id })
  }

  const respuesta = await fetch(`${API_URL}/lotes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serializarLote(lote)),
  })

  if (!respuesta.ok) {
    throw new Error('No fue posible actualizar el lote.')
  }

  const datos = await respuesta.json()
  return normalizarLote(datos)
}

export async function eliminarLote(id) {
  if (!API_URL) {
    return true
  }

  const respuesta = await fetch(`${API_URL}/lotes/${id}`, {
    method: 'DELETE',
  })

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}))
    throw new Error(error.mensaje || 'No fue posible eliminar el lote.')
  }

  return true
}

export async function ocultarLote(id, motivo) {
  if (!API_URL) {
    return true
  }

  const respuesta = await fetch(`${API_URL}/lotes/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motivo }),
  })

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}))
    throw new Error(error.mensaje || 'No fue posible ocultar el lote.')
  }

  return true
}

export async function restaurarLote(id) {
  if (!API_URL) {
    return true
  }

  const respuesta = await fetch(`${API_URL}/lotes/${id}/restaurar`, {
    method: 'PATCH',
  })

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}))
    throw new Error(error.mensaje || 'No fue posible restaurar el lote.')
  }

  return true
}
