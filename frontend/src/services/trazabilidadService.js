const API_URL = import.meta.env.VITE_API_URL

function normalizarRegistro(registro) {
  return {
    idVenta: registro.id_ventas,
    fechaVenta: registro.fecha_venta,
    idCliente: registro.id_cliente,
    cliente: registro.cliente_nombre || 'Público general',
    telefono: registro.telefono || '',
    correo: registro.correo || '',
    idMedicamento: registro.id_med,
    medicamento: registro.medicamento_nombre || '',
    presentacion: registro.presentacion || '',
    concentracion: registro.concentracion || '',
    idLote: registro.id_lote,
    lote: registro.numero_lote || 'Sin lote',
    motivoOculto: registro.motivo_oculto || '',
    cantidad: Number(registro.cantidad) || 0,
    subtotal: Number(registro.subtotal) || 0,
  }
}

export async function buscarCompradoresTrazabilidad(filtros) {
  if (!API_URL) {
    return []
  }

  const params = new URLSearchParams({
    desde: filtros.desde,
    hasta: filtros.hasta,
  })

  if (filtros.idMedicamento) {
    params.set('idMedicamento', filtros.idMedicamento)
  }

  if (filtros.idLote) {
    params.set('idLote', filtros.idLote)
  }

  const respuesta = await fetch(`${API_URL}/trazabilidad/compradores?${params.toString()}`)

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}))
    throw new Error(error.mensaje || 'No fue posible consultar la trazabilidad.')
  }

  const datos = await respuesta.json()
  return (datos.data || []).map(normalizarRegistro)
}
