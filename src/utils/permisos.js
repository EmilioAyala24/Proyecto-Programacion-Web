export const MODULOS = [
  { ruta: '/inicio', etiqueta: 'Inicio', roles: ['admin', 'cajero'] },
  { ruta: '/medicamentos', etiqueta: 'Medicamentos', roles: ['admin', 'cajero'] },
  { ruta: '/lotes', etiqueta: 'Lotes', roles: ['admin'] },
  { ruta: '/proveedores', etiqueta: 'Proveedores', roles: ['admin'] },
  { ruta: '/clientes', etiqueta: 'Clientes', roles: ['admin', 'cajero'] },
  { ruta: '/usuarios', etiqueta: 'Usuarios', roles: ['admin'] },
  { ruta: '/ventas', etiqueta: 'Ventas', roles: ['admin', 'cajero'] },
]

const ALIAS_ROLES = {
  admin: 'admin',
  administrador: 'admin',
  cajero: 'cajero',
  vendedor: 'cajero',
}

export function normalizarRol(rol) {
  if (typeof rol !== 'string') {
    return ''
  }

  return ALIAS_ROLES[rol.trim().toLowerCase()] || ''
}

export function puedeAcceder(rol, ruta) {
  const rolNormalizado = normalizarRol(rol)

  if (ruta === '/dashboard') {
    return rolNormalizado === 'admin'
  }

  const modulo = MODULOS.find((item) => ruta === item.ruta || ruta.startsWith(`${item.ruta}/`))
  return Boolean(modulo?.roles.includes(rolNormalizado))
}

export function obtenerModulosPorRol(rol) {
  const rolNormalizado = normalizarRol(rol)
  return MODULOS.filter((modulo) => modulo.roles.includes(rolNormalizado))
}

export function obtenerRutaInicialPorRol(rol) {
  const rolNormalizado = normalizarRol(rol)
  return rolNormalizado === 'admin' ? '/inicio' : '/ventas'
}

export function obtenerNombreRol(rol) {
  return normalizarRol(rol) === 'admin' ? 'Administrador' : 'Cajero'
}
