const API_URL = import.meta.env.VITE_API_URL
const ZONA_HORARIA = 'America/Mexico_City'

function obtenerPartesFechaMexico(fecha) {
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: ZONA_HORARIA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(fecha).reduce((partes, parte) => {
    partes[parte.type] = parte.value
    return partes
  }, {})
}

function normalizarFechaVenta(valor, diaServidor, horaServidor) {
  if (!valor) {
    return {
      fecha: '',
      fecha_venta: '',
      fecha_venta_dia: diaServidor || '',
      fecha_venta_hora: Number(horaServidor),
    }
  }

  if (/^\d{2}-\d{2}-\d{4}/.test(String(valor))) {
    const [fecha, hora = ''] = String(valor).split('|').map((parte) => parte.trim())
    const [day, month, year] = fecha.split('-')

    return {
      fecha: `${fecha} | ${hora}`,
      fecha_venta: `${fecha} | ${hora}`,
      fecha_venta_dia: year && month && day ? `${year}-${month}-${day}` : diaServidor || '',
      fecha_venta_hora: Number(horaServidor ?? hora.split(':')[0]),
    }
  }

  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) {
    return {
      fecha: String(valor),
      fecha_venta: String(valor),
      fecha_venta_dia: diaServidor || '',
      fecha_venta_hora: Number(horaServidor),
    }
  }

  const ahora = new Date()
  const fechaAjustada = fecha > new Date(ahora.getTime() + 5 * 60 * 1000)
    ? new Date(fecha.getTime() - 6 * 60 * 60 * 1000)
    : fecha
  const partes = obtenerPartesFechaMexico(fechaAjustada)
  const fechaFormateada = `${partes.day}-${partes.month}-${partes.year} | ${partes.hour}:${partes.minute}:${partes.second}`

  return {
    fecha: fechaFormateada,
    fecha_venta: fechaFormateada,
    fecha_venta_dia: `${partes.year}-${partes.month}-${partes.day}`,
    fecha_venta_hora: Number(partes.hour),
  }
}

function normalizarVenta(venta) {
  const fechaVenta = normalizarFechaVenta(
    venta.fecha_venta,
    venta.fecha_venta_dia,
    venta.fecha_venta_hora,
  )

  return {
    id: venta.id_ventas,
    id_ventas: venta.id_ventas,
    fecha: fechaVenta.fecha,
    fecha_venta: fechaVenta.fecha_venta,
    fecha_venta_iso: venta.fecha_venta_iso || '',
    fecha_venta_dia: fechaVenta.fecha_venta_dia,
    fecha_venta_hora: fechaVenta.fecha_venta_hora,
    usuario: venta.usuario_nombre || 'Sin asignar',
    usuario_nombre: venta.usuario_nombre || 'Sin asignar',
    metodoPago: venta.nombre_metodo || 'No especificado',
    cliente: venta.cliente_nombre || 'Público general',
    cliente_nombre: venta.cliente_nombre || 'Público general',
    total: Number(venta.total_venta) || 0,
    cantidad_medicamentos: Number(venta.cantidad_medicamentos) || 0,
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
  return (datos.data || []).map((medicamento) => ({
    ...medicamento,
    stock_actual: Number(medicamento.stock_actual) || 0,
    precio_venta: Number(medicamento.precio_venta) || 0,
  }))
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
