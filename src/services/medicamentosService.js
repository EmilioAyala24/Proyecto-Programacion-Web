import { medicamentosIniciales } from '../data/medicamentos'

const API_URL = import.meta.env.VITE_API_URL

function normalizarMedicamento(medicamento) {
  return {
    id: medicamento.id ?? medicamento.id_med ?? medicamento.id_medicamento,
    nombre: medicamento.nombre,
    presentacion: medicamento.presentacion ?? '',
    concentracion: medicamento.concentracion ?? '',
    contenido: medicamento.contenido ?? '',
    requiereReceta: Boolean(medicamento.requiereReceta ?? medicamento.requiere_receta),
    stockDisponible: Number(medicamento.stockDisponible ?? medicamento.stock_disponible ?? 0),
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
    throw new Error('No fue posible registrar el medicamento.')
  }

  const datos = await respuesta.json()
  return normalizarMedicamento(datos)
}
