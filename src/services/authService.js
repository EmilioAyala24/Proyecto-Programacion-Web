import { normalizarRol } from '../utils/permisos'

const API_URL = import.meta.env.VITE_API_URL
const STORAGE_KEY = 'farmacia_inclusiva_usuario'

function normalizarSesion(sesion) {
  if (!sesion) {
    return null
  }

  const rol = normalizarRol(sesion.rol)

  if (!rol) {
    return null
  }

  return {
    ...sesion,
    rol,
  }
}

export async function login({ usuario, password }) {
  if (!API_URL) {
    throw new Error('No hay URL de API configurada para iniciar sesion.')
  }

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, password }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.mensaje || 'Usuario o contrasena incorrectos.')
  }

  const json = await response.json()
  const sesion = normalizarSesion(json.data)

  if (!sesion) {
    throw new Error('La cuenta no tiene un rol valido para acceder al sistema.')
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sesion))
  return sesion
}

export function obtenerSesion() {
  const sesionGuardada = localStorage.getItem(STORAGE_KEY)

  if (!sesionGuardada) {
    return null
  }

  try {
    const sesion = normalizarSesion(JSON.parse(sesionGuardada))

    if (!sesion) {
      localStorage.removeItem(STORAGE_KEY)
    }

    return sesion
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY)
}
