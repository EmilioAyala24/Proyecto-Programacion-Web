import { medicamentosIniciales } from '../data/medicamentos'

const API_URL = import.meta.env.VITE_API_URL

function normalizarMedicamento(medicamento) {
  return {
    id: medicamento.id ?? medicamento.id_med ?? medicamento.id_medicamento,
    idLote: medicamento.idLote ?? medicamento.id_lote,
    nombre: medicamento.nombre,
    presentacion: medicamento.presentacion ?? '',
    concentracion: medicamento.concentracion ?? '',
    contenido: medicamento.contenido ?? '',
    requiereReceta: Boolean(medicamento.requiereReceta ?? medicamento.requiere_receta),
    stockDisponible: Number(medicamento.stockDisponible ?? medicamento.stock_disponible ?? 0),
    precioUnitario: Number(medicamento.precioUnitario ?? medicamento.precio_unitario ?? 0),
    totalLotes: Number(medicamento.totalLotes ?? medicamento.total_lotes ?? 0),
    lotesVigentes: Number(medicamento.lotesVigentes ?? medicamento.lotes_vigentes ?? 0),
    lotesProximos: Number(medicamento.lotesProximos ?? medicamento.lotes_proximos ?? 0),
    lotesCaducados: Number(medicamento.lotesCaducados ?? medicamento.lotes_caducados ?? 0),
    estadoLotes: medicamento.estadoLotes ?? medicamento.estado_lotes ?? 'Vigente',
  }
}

export async function obtenerMedicamentos() {
  if (!API_URL) {
    return medicamentosIniciales
  }

  const respuesta = await fetch(`${API_URL}/medicamentos`)

  if (!respuesta.ok) {
    throw new Error('No fue posible obtener los medicamentos.')
  }

  const datos = await respuesta.json()
  return datos.map(normalizarMedicamento)
}

export async function crearMedicamento(medicamento) {
  if (!API_URL) {
    return {
      ...medicamento,
      id: Date.now(),
    }
  }

  const respuesta = await fetch(`${API_URL}/medicamentos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(medicamento),
  })

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}))
    throw new Error(error.mensaje || 'No fue posible registrar el medicamento.')
  }

  const datos = await respuesta.json()
  return normalizarMedicamento(datos)
}

export async function actualizarMedicamento(id, medicamento) {
  if (!API_URL) {
    return normalizarMedicamento({ ...medicamento, id })
  }

  const respuesta = await fetch(`${API_URL}/medicamentos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(medicamento),
  })

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}))
    throw new Error(error.mensaje || 'No fue posible actualizar el medicamento.')
  }

  const datos = await respuesta.json()
  return normalizarMedicamento(datos)
}

export async function eliminarMedicamento(id) {
  if (!API_URL) {
    return true
  }

  const respuesta = await fetch(`${API_URL}/medicamentos/${id}`, {
    method: 'DELETE',
  })

  if (!respuesta.ok) {
    throw new Error('No fue posible eliminar el medicamento. Revisa si tiene ventas relacionadas.')
  }

  return true
}
