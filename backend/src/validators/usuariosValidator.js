const LIMITES = {
  usuario: 60,
  nombre: 80,
  apellido: 60,
  telefono: 15,
  password: 100,
}

const patronUsuario = /^[a-zA-Z0-9_.-]+$/
const patronNombrePersona = /^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/
const patronTelefono = /^[0-9+\-()\s]+$/
const PREFIJO_TELEFONO = '(312)'
const DIGITOS_TELEFONO_LOCAL = 7

function validarNombrePersona(valor, campo, maximo, obligatorio = true) {
  const texto = typeof valor === 'string' ? valor.trim() : ''

  if (!texto) {
    return obligatorio ? `${campo} es requerido` : ''
  }

  if (texto.length < 2) {
    return `${campo} debe tener al menos 2 caracteres`
  }

  if (texto.length > maximo) {
    return `${campo} no puede exceder ${maximo} caracteres`
  }

  if (!patronNombrePersona.test(texto)) {
    return `${campo} solo puede contener letras, espacios, apóstrofe o guion`
  }

  return ''
}

function validarTelefono(valor) {
  const texto = typeof valor === 'string' ? valor.trim() : ''

  if (!texto) {
    return ''
  }

  const digitos = texto.replace(/\D/g, '')
  const digitosLocales = digitos.startsWith('312') ? digitos.slice(3) : digitos

  if (
    texto.length > LIMITES.telefono ||
    !texto.startsWith(PREFIJO_TELEFONO) ||
    digitosLocales.length !== DIGITOS_TELEFONO_LOCAL ||
    !patronTelefono.test(texto)
  ) {
    return `El teléfono debe completar ${DIGITOS_TELEFONO_LOCAL} dígitos después de ${PREFIJO_TELEFONO}`
  }

  return ''
}

export function validarUsuario(usuario) {
  const errores = {}
  const username = typeof usuario.usuario === 'string' ? usuario.usuario.trim() : ''
  const rol = typeof usuario.rol === 'string' ? usuario.rol.toLowerCase().trim() : ''

  if (!username) {
    errores.usuario = 'El usuario es requerido'
  } else if (username.length < 3) {
    errores.usuario = 'El usuario debe tener al menos 3 caracteres'
  } else if (username.length > LIMITES.usuario) {
    errores.usuario = `El usuario no puede exceder ${LIMITES.usuario} caracteres`
  } else if (!patronUsuario.test(username)) {
    errores.usuario = 'El usuario solo puede contener letras, números, guion, guion bajo y punto'
  }

  if (!rol) {
    errores.rol = 'El rol es requerido'
  } else if (!['admin', 'cajero'].includes(rol)) {
    errores.rol = 'El rol debe ser uno de: admin o cajero'
  }

  errores.nombre = validarNombrePersona(usuario.nombre, 'El nombre', LIMITES.nombre)
  errores.ap_pat = validarNombrePersona(
    usuario.ap_pat,
    'El apellido paterno',
    LIMITES.apellido,
    false,
  )
  errores.ap_mat = validarNombrePersona(
    usuario.ap_mat,
    'El apellido materno',
    LIMITES.apellido,
    false,
  )
  errores.telefono = validarTelefono(usuario.telefono)

  if (usuario.requierePassword) {
    if (!usuario.password) {
      errores.password = 'La contraseña es requerida'
    }
  }

  if (usuario.password) {
    const password = String(usuario.password)

    if (password.length < 8) {
      errores.password = 'La contraseña debe tener al menos 8 caracteres'
    } else if (password.length > LIMITES.password) {
      errores.password = `La contraseña no puede exceder ${LIMITES.password} caracteres`
    } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      errores.password = 'La contraseña debe incluir mayúscula, minúscula y número'
    }
  }

  Object.keys(errores).forEach((llave) => {
    if (!errores[llave]) {
      delete errores[llave]
    }
  })

  return errores
}
