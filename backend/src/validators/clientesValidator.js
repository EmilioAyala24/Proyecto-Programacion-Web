const LIMITES = {
  nombre: 80,
  apellido: 60,
  telefono: 15,
  correo: 100,
}

const patronNombrePersona = /^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/
const patronTelefono = /^[0-9+\-()\s]+$/
const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
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

function validarCorreo(valor) {
  const texto = typeof valor === 'string' ? valor.trim() : ''

  if (!texto) {
    return ''
  }

  if (texto.length > LIMITES.correo || !patronCorreo.test(texto)) {
    return 'Ingresa un correo valido.'
  }

  return ''
}

export function validarCliente(cliente) {
  const errores = {}

  errores.nombre = validarNombrePersona(cliente.nombre, 'El nombre', LIMITES.nombre)
  errores.ap_pat = validarNombrePersona(
    cliente.ap_pat,
    'El apellido paterno',
    LIMITES.apellido,
    false,
  )
  errores.ap_mat = validarNombrePersona(
    cliente.ap_mat,
    'El apellido materno',
    LIMITES.apellido,
    false,
  )
  errores.telefono = validarTelefono(cliente.telefono)
  errores.correo = validarCorreo(cliente.correo)

  Object.keys(errores).forEach((llave) => {
    if (!errores[llave]) {
      delete errores[llave]
    }
  })

  return errores
}
