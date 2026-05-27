const LIMITES = {
  nombre: 100,
  telefono: 15,
  correo: 100,
  direccion: 200,
}

const patronNombreProveedor = /^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ0-9 .,&'-]+$/
const patronTelefono = /^[0-9+\-\s()]+$/
const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const patronDireccion = /^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ0-9 .,#/()-]+$/
const PREFIJO_TELEFONO = '(312)'
const DIGITOS_TELEFONO_LOCAL = 7

export function validarProveedor(datos) {
  const errores = {}
  const nombre = datos.nombre?.trim() ?? ''
  const telefono = datos.telefono?.trim() ?? ''
  const correo = datos.correo?.trim() ?? ''
  const direccion = datos.direccion?.trim() ?? ''
  const digitosTelefono = telefono.replace(/\D/g, '')
  const digitosLocalesTelefono = digitosTelefono.startsWith('312')
    ? digitosTelefono.slice(3)
    : digitosTelefono

  if (!nombre) {
    errores.nombre = 'El nombre del proveedor es obligatorio.'
  } else if (nombre.length < 3) {
    errores.nombre = 'El nombre debe tener al menos 3 caracteres.'
  } else if (nombre.length > LIMITES.nombre) {
    errores.nombre = `El nombre no puede exceder ${LIMITES.nombre} caracteres.`
  } else if (!patronNombreProveedor.test(nombre)) {
    errores.nombre = 'El nombre del proveedor contiene caracteres no permitidos.'
  }

  if (!telefono) {
    errores.telefono = 'El teléfono es obligatorio.'
  } else if (
    telefono.length > LIMITES.telefono ||
    !telefono.startsWith(PREFIJO_TELEFONO) ||
    digitosLocalesTelefono.length !== DIGITOS_TELEFONO_LOCAL ||
    !patronTelefono.test(telefono)
  ) {
    errores.telefono = `El teléfono debe completar ${DIGITOS_TELEFONO_LOCAL} dígitos después de ${PREFIJO_TELEFONO}.`
  }

  if (!correo) {
    errores.correo = 'El correo es obligatorio.'
  } else if (correo.length > LIMITES.correo) {
    errores.correo = `El correo no puede exceder ${LIMITES.correo} caracteres.`
  } else if (!patronCorreo.test(correo)) {
    errores.correo = 'El correo no tiene un formato valido.'
  }

  if (!direccion) {
    errores.direccion = 'La dirección es obligatoria.'
  } else if (direccion.length > LIMITES.direccion) {
    errores.direccion = `La dirección no puede exceder ${LIMITES.direccion} caracteres.`
  } else if (!patronDireccion.test(direccion)) {
    errores.direccion = 'La dirección contiene caracteres no permitidos.'
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
    datosLimpios: { nombre, telefono, correo, direccion },
  }
}
