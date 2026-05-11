const patronNombreProveedor = /^[a-zA-Z0-9 .,&-]+$/
const patronTelefono = /^[0-9+\-\s()]+$/
const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validarProveedor(datos) {
  const errores = {}
  const nombre = datos.nombre?.trim() ?? ''
  const telefono = datos.telefono?.trim() ?? ''
  const correo = datos.correo?.trim() ?? ''
  const direccion = datos.direccion?.trim() ?? ''

  if (!nombre) {
    errores.nombre = 'El nombre del proveedor es obligatorio.'
  } else if (nombre.length < 3 || !patronNombreProveedor.test(nombre)) {
    errores.nombre = 'El nombre del proveedor contiene caracteres no permitidos.'
  }

  if (!telefono) {
    errores.telefono = 'El telefono es obligatorio.'
  } else if (!patronTelefono.test(telefono) || telefono.replace(/\D/g, '').length < 10) {
    errores.telefono = 'El telefono debe tener al menos 10 digitos.'
  }

  if (!correo) {
    errores.correo = 'El correo es obligatorio.'
  } else if (!patronCorreo.test(correo)) {
    errores.correo = 'El correo no tiene un formato valido.'
  }

  if (!direccion) {
    errores.direccion = 'La direccion es obligatoria.'
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
    datosLimpios: { nombre, telefono, correo, direccion },
  }
}
