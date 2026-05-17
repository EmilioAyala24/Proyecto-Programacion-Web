const API_URL = import.meta.env.VITE_API_URL

function normalizarVenta(venta) {
  return {
    id: venta.id_ventas,
    fecha: venta.fecha_venta ? new Date(venta.fecha_venta).toLocaleDateString() : '',
    usuario: venta.usuario_nombre || 'Sin asignar',
    metodoPago: venta.nombre_metodo || 'No especificado',
    cliente: venta.cliente_nombre || 'Público general',
    total: Number(venta.total_venta) || 0,
    cantidad_medicamentos: venta.cantidad_medicamentos || 0,
  }
}

function normalizarDetalle(detalle) {
  return {
    id: detalle.id_detalle,
    medicamento: detalle.medicamento_nombre || 'Desconocido',
    presentacion: detalle.presentacion || '',
    concentracion: detalle.concentracion || '',
    cantidad: detalle.cantidad || 0,
    precio_unitario: Number(detalle.precio_unitario) || 0,
    subtotal: Number(detalle.subtotal) || 0,
  }
}

export async function obtenerVentas() {
  if (!API_URL) {
    return []
  }

  const respuesta = await fetch(`${API_URL}/ventas`)

  if (!respuesta.ok) {
    throw new Error('No fue posible obtener las ventas.')
  }

  const datos = await respuesta.json()
  return datos.data ? datos.data.map(normalizarVenta) : []
}

export async function obtenerDetalleVenta(idVenta) {
  if (!API_URL) {
    return []
  }

  const respuesta = await fetch(`${API_URL}/ventas/${idVenta}`)

  if (!respuesta.ok) {
    throw new Error('No fue posible obtener los detalles de la venta.')
  }

  const datos = await respuesta.json()
  return datos.data ? datos.data.map(normalizarDetalle) : []
}

export async function obtenerMetodosPago() {
  if (!API_URL) {
    return []
  }

  const respuesta = await fetch(`${API_URL}/ventas/opciones/metodos-pago`)

  if (!respuesta.ok) {
    throw new Error('No fue posible obtener los métodos de pago.')
  }

  const datos = await respuesta.json()
  return datos.data || []
}

export async function obtenerClientes() {
  if (!API_URL) {
    return []
  }

  const respuesta = await fetch(`${API_URL}/ventas/opciones/clientes`)

  if (!respuesta.ok) {
    throw new Error('No fue posible obtener los clientes.')
  }

  const datos = await respuesta.json()
  return datos.data || []
}

export async function obtenerMedicamentosDisponibles() {
  if (!API_URL) {
    return []
  }

  const respuesta = await fetch(`${API_URL}/ventas/opciones/medicamentos`)

  if (!respuesta.ok) {
    throw new Error('No fue posible obtener los medicamentos disponibles.')
  }

  const datos = await respuesta.json()
  return datos.data || []
}

export async function crearVenta(datosVenta) {
  if (!API_URL) {
    return {
      id: Date.now(),
      ...datosVenta,
    }
  }

  const respuesta = await fetch(`${API_URL}/ventas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datosVenta),
  })

  if (!respuesta.ok) {
    const error = await respuesta.json()
    throw new Error(error.error || 'No fue posible crear la venta.')
  }

  return await respuesta.json()
}
