import { lotesIniciales } from '../data/lotes'

const API_URL = import.meta.env.VITE_API_URL

function obtenerEstadoPorCaducidad(fechaCaducidad) {
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

function normalizarLote(lote) {
  const fechaCaducidad = lote.fechaCaducidad ?? lote.fecha_caducidad
  const fechaIngreso = lote.fechaIngreso ?? lote.fecha_ingreso ?? ''

  return {
    id: lote.id ?? lote.id_lote,
    codigo: lote.codigo ?? lote.codigo_lote,
    medicamento: lote.medicamento ?? lote.nombre_medicamento ?? '',
    proveedor: lote.proveedor ?? lote.nombre_proveedor ?? '',
    stockDisponible: Number(lote.stockDisponible ?? lote.stock_disponible ?? 0),
    fechaIngreso: String(fechaIngreso).split('T')[0],
    fechaCaducidad: String(fechaCaducidad).split('T')[0],
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
