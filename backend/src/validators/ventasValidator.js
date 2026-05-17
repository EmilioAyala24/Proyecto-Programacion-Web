export function validarVenta(datos) {
  const errores = {}

  // Validar usuario
  if (!datos.id_usuario) {
    errores.id_usuario = 'El usuario es requerido'
  } else if (typeof datos.id_usuario !== 'number' || datos.id_usuario <= 0) {
    errores.id_usuario = 'El usuario debe ser válido'
  }

  // Validar método de pago
  if (!datos.id_metPag) {
    errores.id_metPag = 'El método de pago es requerido'
  } else if (typeof datos.id_metPag !== 'number' || datos.id_metPag <= 0) {
    errores.id_metPag = 'El método de pago debe ser válido'
  }

  // Validar detalles
  if (!datos.detalles || !Array.isArray(datos.detalles) || datos.detalles.length === 0) {
    errores.detalles = 'La venta debe contener al menos un medicamento'
  } else {
    const detallesConError = datos.detalles.filter(
      (detalle) => !validarDetalle(detalle),
    )

    if (detallesConError.length > 0) {
      errores.detalles = 'Hay errores en los medicamentos de la venta'
    }
  }

  return Object.keys(errores).length === 0 ? null : errores
}

export function validarDetalle(detalle) {
  if (!detalle.id_medicamento || detalle.id_medicamento <= 0) {
    return false
  }

  if (!detalle.cantidad || detalle.cantidad <= 0 || !Number.isInteger(detalle.cantidad)) {
    return false
  }

  if (!detalle.precio_unitario || detalle.precio_unitario <= 0) {
    return false
  }

  if (!detalle.subtotal || detalle.subtotal < 0) {
    return false
  }

  return true
}
