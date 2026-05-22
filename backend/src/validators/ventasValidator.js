export function validarVenta(datos) {
  const errores = {}
  const idUsuario = Number(datos.id_usuario)
  const idMetodoPago = Number(datos.id_metPag)

  if (!idUsuario || Number.isNaN(idUsuario) || idUsuario <= 0) {
    errores.id_usuario = 'El usuario debe ser valido.'
  }

  if (!idMetodoPago || Number.isNaN(idMetodoPago) || idMetodoPago <= 0) {
    errores.id_metPag = 'El metodo de pago debe ser valido.'
  }

  if (!datos.detalles || !Array.isArray(datos.detalles) || datos.detalles.length === 0) {
    errores.detalles = 'La venta debe contener al menos un medicamento.'
  } else {
    const detallesConError = datos.detalles.filter(
      (detalle) => !validarDetalle(detalle),
    )

    if (detallesConError.length > 0) {
      errores.detalles = 'Hay errores en los medicamentos de la venta.'
    }
  }

  return Object.keys(errores).length === 0 ? null : errores
}

export function validarDetalle(detalle) {
  const idMedicamento = Number(detalle.id_medicamento)
  const cantidad = Number(detalle.cantidad)
  const precioUnitario = Number(detalle.precio_unitario)

  if (!idMedicamento || Number.isNaN(idMedicamento) || idMedicamento <= 0) {
    return false
  }

  if (
    !cantidad ||
    Number.isNaN(cantidad) ||
    cantidad <= 0 ||
    cantidad > 999999 ||
    !Number.isInteger(cantidad)
  ) {
    return false
  }

  if (
    !precioUnitario ||
    Number.isNaN(precioUnitario) ||
    precioUnitario <= 0 ||
    precioUnitario > 99999999.99 ||
    !/^\d+(\.\d{1,2})?$/.test(String(detalle.precio_unitario))
  ) {
    return false
  }

  return true
}
