const patronUsuario = /^[a-zA-Z0-9._-]+$/

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
