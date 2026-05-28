import { proveedoresIniciales } from '../data/proveedores'

const API_URL = import.meta.env.VITE_API_URL

function normalizarProveedor(proveedor) {
  return {
    id: proveedor.id ?? proveedor.id_prov,
    nombre: proveedor.nombre,
    telefono: proveedor.telefono ?? '',
    correo: proveedor.correo ?? '',
    direccion: proveedor.direccion ?? '',
    estado: proveedor.estado ?? 'Activo',
  }
}

export async function obtenerProveedores() {
  if (!API_URL) {
    return proveedoresIniciales
  }

  const respuesta = await fetch(`${API_URL}/proveedores`)

  if (!respuesta.ok) {
    throw new Error('No fue posible obtener los proveedores.')
  }

  const datos = await respuesta.json()
  return datos.map(normalizarProveedor)
}

export async function crearProveedor(proveedor) {
  if (!API_URL) {
    return {
      ...proveedor,
      id: Date.now(),
      estado: 'Activo',
    }
  }

  const respuesta = await fetch(`${API_URL}/proveedores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(proveedor),
  })

  if (!respuesta.ok) {
    throw new Error('No fue posible registrar el proveedor.')
  }

  const datos = await respuesta.json()
  return normalizarProveedor(datos)
}

export async function actualizarProveedor(id, proveedor) {
  if (!API_URL) {
    return normalizarProveedor({ ...proveedor, id })
  }

  const respuesta = await fetch(`${API_URL}/proveedores/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(proveedor),
  })

  if (!respuesta.ok) {
    throw new Error('No fue posible actualizar el proveedor.')
  }

  const datos = await respuesta.json()
  return normalizarProveedor(datos)
}

export async function eliminarProveedor(id) {
  if (!API_URL) {
    return true
  }

  const respuesta = await fetch(`${API_URL}/proveedores/${id}`, {
    method: 'DELETE',
  })

  if (!respuesta.ok) {
    throw new Error('No fue posible eliminar el proveedor. Revisa si tiene lotes asociados.')
  }

  return true
}
