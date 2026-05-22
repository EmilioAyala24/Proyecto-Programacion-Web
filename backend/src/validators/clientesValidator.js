const LIMITES = {
  nombre: 80,
  apellido: 60,
  telefono: 15,
}

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

  Object.keys(errores).forEach((llave) => {
    if (!errores[llave]) {
      delete errores[llave]
    }
  })

  return errores
}
