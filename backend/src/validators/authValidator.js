const patronUsuario = /^[a-zA-Z0-9_.-]+$/

export function validarLogin(datos) {
  const errores = {}
  const usuario = datos.usuario?.trim() ?? ''
  const password = datos.password ?? ''

  if (!usuario) {
    errores.usuario = 'El usuario es obligatorio.'
  } else if (usuario.length > 60 || !patronUsuario.test(usuario)) {
    errores.usuario = 'El usuario no tiene un formato válido.'
  }

  if (!password) {
    errores.password = 'La contraseña es obligatoria.'
  } else if (password.length > 100) {
    errores.password = 'La contraseña no puede exceder 100 caracteres.'
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
    datosLimpios: { usuario, password },
  }
}
