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
    return `${campo} solo puede contener letras, espacios, apostrofe o guion`
  }

  return ''
}

function validarTelefono(valor) {
  const texto = typeof valor === 'string' ? valor.trim() : ''

  if (!texto) {
    return ''
  }

  const digitos = texto.replace(/\D/g, '').length

  if (
    texto.length > LIMITES.telefono ||
    digitos < 7 ||
    digitos > 15 ||
    !patronTelefono.test(texto)
  ) {
    return 'El telefono debe ser valido y tener de 7 a 15 digitos'
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
    errores.usuario = 'El usuario solo puede contener letras, numeros, guion, guion bajo y punto'
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
      errores.password = 'La contrasena es requerida'
    }
  }

  if (usuario.password) {
    const password = String(usuario.password)

    if (password.length < 8) {
      errores.password = 'La contrasena debe tener al menos 8 caracteres'
    } else if (password.length > LIMITES.password) {
      errores.password = `La contrasena no puede exceder ${LIMITES.password} caracteres`
    } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      errores.password = 'La contrasena debe incluir mayuscula, minuscula y numero'
    }
  }

  Object.keys(errores).forEach((llave) => {
    if (!errores[llave]) {
      delete errores[llave]
    }
  })

  return errores
}
