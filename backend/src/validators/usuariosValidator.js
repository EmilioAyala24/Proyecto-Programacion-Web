export function validarUsuario(usuario) {
  const errores = {}

  // Validar usuario (username)
  if (!usuario.usuario || typeof usuario.usuario !== 'string') {
    errores.usuario = 'El usuario (nombre de usuario) es requerido y debe ser texto'
  } else if (usuario.usuario.trim().length < 3) {
    errores.usuario = 'El usuario debe tener al menos 3 caracteres'
  } else if (usuario.usuario.trim().length > 60) {
    errores.usuario = 'El usuario no puede exceder 60 caracteres'
  } else if (!/^[a-zA-Z0-9_.-]+$/.test(usuario.usuario.trim())) {
    errores.usuario = 'El usuario solo puede contener letras, números, guiones y puntos'
  }

  // Validar rol
  if (!usuario.rol || typeof usuario.rol !== 'string') {
    errores.rol = 'El rol es requerido y debe ser texto'
  } else if (!['admin', 'cajero'].includes(usuario.rol.toLowerCase())) {
    errores.rol = 'El rol debe ser uno de: admin o cajero'
  }

  // Validar nombre
  if (!usuario.nombre || typeof usuario.nombre !== 'string') {
    errores.nombre = 'El nombre es requerido y debe ser texto'
  } else if (usuario.nombre.trim().length < 3) {
    errores.nombre = 'El nombre debe tener al menos 3 caracteres'
  } else if (usuario.nombre.trim().length > 80) {
    errores.nombre = 'El nombre no puede exceder 80 caracteres'
  }

  // Validar apellido paterno (opcional)
  if (usuario.ap_pat && typeof usuario.ap_pat === 'string') {
    if (usuario.ap_pat.trim().length > 60) {
      errores.ap_pat = 'El apellido paterno no puede exceder 60 caracteres'
    }
  }

  // Validar apellido materno (opcional)
  if (usuario.ap_mat && typeof usuario.ap_mat === 'string') {
    if (usuario.ap_mat.trim().length > 60) {
      errores.ap_mat = 'El apellido materno no puede exceder 60 caracteres'
    }
  }

  // Validar teléfono (opcional)
  if (usuario.telefono && typeof usuario.telefono === 'string') {
    if (!/^[0-9+\-()\s]{7,15}$/.test(usuario.telefono.trim())) {
      errores.telefono = 'El teléfono debe ser válido (7-15 caracteres)'
    }
  }

  return errores
}
