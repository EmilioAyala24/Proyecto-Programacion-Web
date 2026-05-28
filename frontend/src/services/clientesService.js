const API_URL = import.meta.env.VITE_API_URL

function formatearFechaHora(valor) {
  if (!valor) {
    return ''
  }

  const texto = String(valor).trim()
  const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)

  if (iso) {
    const [, anio, mes, dia, hora, minuto, segundo] = iso
    return `${dia}-${mes}-${anio}  |  ${hora}:${minuto}:${segundo}`
  }

  const fechaHora = texto.match(/^(\d{2})[/-](\d{2})[/-](\d{4})\s+\|?\s*(\d{2}):(\d{2})(?::(\d{2}))?/)

  if (fechaHora) {
    const [, dia, mes, anio, hora, minuto, segundo = '00'] = fechaHora
    return `${dia}-${mes}-${anio}  |  ${hora}:${minuto}:${segundo}`
  }

  const fechaSimple = texto.match(/^(\d{4})-(\d{2})-(\d{2})/)

  if (fechaSimple) {
    const [, anio, mes, dia] = fechaSimple
    return `${dia}-${mes}-${anio}  |  00:00:00`
  }

  return texto
}

function normalizarCliente(cliente) {
  return {
    id: cliente.id_cliente,
    nombre: cliente.nombre,
    apPat: cliente.ap_pat,
    apMat: cliente.ap_mat,
    fechaRegistro: formatearFechaHora(cliente.fecha_registro),
    telefono: cliente.telefono,
    correo: cliente.correo ?? '',
  }
}

export async function obtenerClientes() {
  const response = await fetch(`${API_URL}/clientes`)

  if (!response.ok) {
    throw new Error('Error al obtener clientes')
  }

  const json = await response.json()
  return json.data.map(normalizarCliente)
}

export async function obtenerClientePorId(id) {
  const response = await fetch(`${API_URL}/clientes/${id}`)

  if (!response.ok) {
    throw new Error('Error al obtener cliente')
  }

  const json = await response.json()
  const cliente = json.data

  return normalizarCliente(cliente)
}

export async function crearCliente(cliente) {
  const response = await fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nombre: cliente.nombre,
      ap_pat: cliente.apPat || null,
      ap_mat: cliente.apMat || null,
      telefono: cliente.telefono || null,
      correo: cliente.correo || null,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errores?.nombre || error.mensaje || 'Error al crear cliente')
  }

  const json = await response.json()
  const clienteCreado = json.data

  return normalizarCliente(clienteCreado)
}

export async function actualizarCliente(id, cliente) {
  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nombre: cliente.nombre,
      ap_pat: cliente.apPat || null,
      ap_mat: cliente.apMat || null,
      telefono: cliente.telefono || null,
      correo: cliente.correo || null,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errores?.nombre || error.mensaje || 'Error al actualizar cliente')
  }

  const json = await response.json()
  const clienteActualizado = json.data

  return normalizarCliente(clienteActualizado)
}

export async function eliminarCliente(id) {
  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Error al eliminar cliente')
  }

  return true
}
