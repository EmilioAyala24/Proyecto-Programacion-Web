const API_URL = import.meta.env.VITE_API_URL

function normalizarDetalleQR(detalle) {
  return {
    idQr: detalle.id_qr,
    token: detalle.token,
    urlQr: detalle.url_qr,
    contadorEscaneos: Number(detalle.contador_escaneos || 0),
    lote: {
      id: detalle.id_lote,
      numero: detalle.numero_lote,
      fechaFabricacion: detalle.fecha_fabricacion ? String(detalle.fecha_fabricacion).split('T')[0] : '',
      fechaCaducidad: detalle.fecha_caducidad ? String(detalle.fecha_caducidad).split('T')[0] : '',
      fechaIngreso: detalle.fecha_ingreso ? String(detalle.fecha_ingreso).split('T')[0] : '',
      stock: Number(detalle.stock_actual || 0),
      precioVenta: Number(detalle.precio_venta || 0),
      proveedor: detalle.proveedor_nombre,
    },
    medicamento: {
      id: detalle.id_med,
      nombre: detalle.medicamento_nombre,
      presentacion: detalle.presentacion || '',
      concentracion: detalle.concentracion || '',
      contenido: detalle.contenido || '',
      requiereReceta: Boolean(detalle.requiere_receta),
    },
  }
}

export async function obtenerQRLote(idLote) {
  if (!API_URL) {
    throw new Error('No hay URL de API configurada para generar QR.')
  }

  const respuesta = await fetch(`${API_URL}/qrs/lotes/${idLote}`)

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}))
    throw new Error(error.mensaje || `No fue posible generar el QR del lote. Código ${respuesta.status}.`)
  }

  const json = await respuesta.json()
  return json.data
}

export async function obtenerDetalleQR(token) {
  if (!API_URL) {
    throw new Error('No hay URL de API configurada para leer QR.')
  }

  const respuesta = await fetch(`${API_URL}/qrs/scan/${token}`)

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}))
    throw new Error(error.mensaje || `No fue posible obtener la información del QR. Código ${respuesta.status}.`)
  }

  const json = await respuesta.json()
  return normalizarDetalleQR(json.data)
}
