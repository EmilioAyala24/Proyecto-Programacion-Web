export function validarCliente(cliente) {
  const errores = {}

  // Validar nombre
  if (!cliente.nombre || typeof cliente.nombre !== 'string') {
    errores.nombre = 'El nombre es requerido y debe ser texto'
  } else if (cliente.nombre.trim().length < 3) {
    errores.nombre = 'El nombre debe tener al menos 3 caracteres'
  } else if (cliente.nombre.trim().length > 80) {
    errores.nombre = 'El nombre no puede exceder 80 caracteres'
  }

  // Validar apellido paterno (opcional)
  if (cliente.ap_pat && typeof cliente.ap_pat === 'string') {
    if (cliente.ap_pat.trim().length > 60) {
      errores.ap_pat = 'El apellido paterno no puede exceder 60 caracteres'
    }
  }

  // Validar apellido materno (opcional)
  if (cliente.ap_mat && typeof cliente.ap_mat === 'string') {
    if (cliente.ap_mat.trim().length > 60) {
      errores.ap_mat = 'El apellido materno no puede exceder 60 caracteres'
    }
  }

  // Validar teléfono (opcional)
  if (cliente.telefono && typeof cliente.telefono === 'string') {
    if (!/^[0-9+\-()\s]{7,15}$/.test(cliente.telefono.trim())) {
      errores.telefono = 'El teléfono debe ser válido (7-15 caracteres)'
    }
  }

  return errores
}
