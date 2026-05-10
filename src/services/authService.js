import { usuarios } from '../data/usuarios'

const STORAGE_KEY = 'farmacia_inclusiva_usuario'

export function login({ usuario, password }) {
  const usuarioEncontrado = usuarios.find(
    (item) => item.usuario === usuario.trim() && item.password === password,
  )

  if (!usuarioEncontrado) {
    throw new Error('Usuario o contraseña incorrectos.')
  }

  const sesion = {
    id: usuarioEncontrado.id,
    usuario: usuarioEncontrado.usuario,
    nombre: usuarioEncontrado.nombre,
    rol: usuarioEncontrado.rol,
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
    return JSON.parse(sesionGuardada)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY)
}
