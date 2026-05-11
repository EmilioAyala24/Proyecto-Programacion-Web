const patronUsuario = /^[a-zA-Z0-9._-]+$/
const patronNombreProveedor = /^[a-zA-Z0-9 .,&-]+$/
const patronTelefono = /^[0-9+\-\s()]+$/
const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validarUsuario(usuario) {
  const valor = usuario.trim()

  if (!valor) {
    return 'El usuario es obligatorio.'
  }

  if (valor.length < 4) {
    return 'El usuario debe tener al menos 4 caracteres.'
  }

  if (!patronUsuario.test(valor)) {
    return 'Usa solo letras, numeros, punto, guion o guion bajo.'
  }

  return ''
}

export function obtenerReglasPassword(password) {
  return [
    {
      id: 'longitud',
      texto: 'Mínimo 8 caracteres',
      valida: password.length >= 8,
    },
    {
      id: 'mayuscula',
      texto: 'Una letra mayúscula',
      valida: /[A-Z]/.test(password),
    },
    {
      id: 'minuscula',
      texto: 'Una letra minúscula',
      valida: /[a-z]/.test(password),
    },
    {
      id: 'numero',
      texto: 'Un número',
      valida: /\d/.test(password),
    },
    {
      id: 'simbolo',
      texto: 'Un símbolo',
      valida: /[^a-zA-Z0-9]/.test(password),
    },
  ]
}

export function obtenerSeguridadPassword(password) {
  const reglas = obtenerReglasPassword(password)
  const cumplidas = reglas.filter((regla) => regla.valida).length

  if (!password) {
    return {
      nivel: 'Sin contraseña',
      clase: 'vacia',
      puntaje: 0,
      reglas,
    }
  }

  if (cumplidas <= 2) {
    return {
      nivel: 'Débil',
      clase: 'debil',
      puntaje: cumplidas,
      reglas,
    }
  }

  if (cumplidas < reglas.length) {
    return {
      nivel: 'Media',
      clase: 'media',
      puntaje: cumplidas,
      reglas,
    }
  }

  return {
    nivel: 'Segura',
    clase: 'segura',
    puntaje: cumplidas,
    reglas,
  }
}

export function validarPassword(password) {
  if (!password) {
    return 'La contraseña es obligatoria.'
  }

  const seguridad = obtenerSeguridadPassword(password)

  if (seguridad.puntaje < 3) {
    return 'La contraseña es demasiado débil.'
  }

  return ''
}

export function validarProveedor(nombre) {
  const valor = nombre.trim()

  if (!valor) {
    return 'El nombre del proveedor es obligatorio.'
  }

  if (valor.length < 3) {
    return 'El nombre debe tener al menos 3 caracteres.'
  }

  if (!patronNombreProveedor.test(valor)) {
    return 'Usa solo letras, numeros, espacios, punto, coma, & o guion.'
  }

  return ''
}

export function validarTelefono(telefono) {
  const valor = telefono.trim()

  if (!valor) {
    return 'El telefono es obligatorio.'
  }

  if (!patronTelefono.test(valor) || valor.replace(/\D/g, '').length < 10) {
    return 'Ingresa un telefono valido de al menos 10 digitos.'
  }

  return ''
}

export function validarCorreo(correo) {
  const valor = correo.trim()

  if (!valor) {
    return 'El correo es obligatorio.'
  }

  if (!patronCorreo.test(valor)) {
    return 'Ingresa un correo valido.'
  }

  return ''
}
