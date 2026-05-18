const API_URL = import.meta.env.VITE_API_URL

export async function obtenerClientes() {
  const response = await fetch(`${API_URL}/clientes`)

  if (!response.ok) {
    throw new Error('Error al obtener clientes')
  }

  const json = await response.json()
  return json.data.map((cliente) => ({
    id: cliente.id_cliente,
    nombre: cliente.nombre,
    apPat: cliente.ap_pat,
    apMat: cliente.ap_mat,
    fechaRegistro: cliente.fecha_registro,
    telefono: cliente.telefono,
  }))
}

export async function obtenerClientePorId(id) {
  const response = await fetch(`${API_URL}/clientes/${id}`)

  if (!response.ok) {
    throw new Error('Error al obtener cliente')
  }

  const json = await response.json()
  const cliente = json.data

  return {
    id: cliente.id_cliente,
    nombre: cliente.nombre,
    apPat: cliente.ap_pat,
    apMat: cliente.ap_mat,
    fechaRegistro: cliente.fecha_registro,
    telefono: cliente.telefono,
  }
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
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errores?.nombre || error.mensaje || 'Error al crear cliente')
  }

  const json = await response.json()
  const clienteCreado = json.data

  return {
    id: clienteCreado.id_cliente,
    nombre: clienteCreado.nombre,
    apPat: clienteCreado.ap_pat,
    apMat: clienteCreado.ap_mat,
    fechaRegistro: clienteCreado.fecha_registro,
    telefono: clienteCreado.telefono,
  }
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
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errores?.nombre || error.mensaje || 'Error al actualizar cliente')
  }

  const json = await response.json()
  const clienteActualizado = json.data

  return {
    id: clienteActualizado.id_cliente,
    nombre: clienteActualizado.nombre,
    apPat: clienteActualizado.ap_pat,
    apMat: clienteActualizado.ap_mat,
    fechaRegistro: clienteActualizado.fecha_registro,
    telefono: clienteActualizado.telefono,
  }
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
