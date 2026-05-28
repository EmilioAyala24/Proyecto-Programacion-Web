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

function normalizarUsuario(usuario) {
  return {
    id: usuario.id_usuario,
    usuario: usuario.usuario,
    rol: usuario.rol,
    nombre: usuario.nombre,
    apPat: usuario.ap_pat,
    apMat: usuario.ap_mat,
    telefono: usuario.telefono,
    fechaCreacion: formatearFechaHora(usuario.fecha_creacion),
    ultimaConexion: formatearFechaHora(usuario.ultima_conexion),
  }
}

export async function obtenerUsuarios() {
  const response = await fetch(`${API_URL}/usuarios`)

  if (!response.ok) {
    throw new Error('Error al obtener usuarios')
  }

  const json = await response.json()
  return json.data.map(normalizarUsuario)
}

export async function obtenerUsuarioPorId(id) {
  const response = await fetch(`${API_URL}/usuarios/${id}`)

  if (!response.ok) {
    throw new Error('Error al obtener usuario')
  }

  const json = await response.json()
  const usuario = json.data

  return normalizarUsuario(usuario)
}

export async function crearUsuario(nuevoUsuario) {
  const response = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      usuario: nuevoUsuario.usuario,
      rol: nuevoUsuario.rol,
      nombre: nuevoUsuario.nombre,
      ap_pat: nuevoUsuario.apPat || null,
      ap_mat: nuevoUsuario.apMat || null,
      telefono: nuevoUsuario.telefono || null,
      password: nuevoUsuario.password,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errores?.usuario || error.mensaje || 'Error al crear usuario')
  }

  const json = await response.json()
  const usuarioCreado = json.data

  return normalizarUsuario(usuarioCreado)
}

export async function actualizarUsuario(id, usuarioActualizado) {
  const response = await fetch(`${API_URL}/usuarios/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      usuario: usuarioActualizado.usuario,
      rol: usuarioActualizado.rol,
      nombre: usuarioActualizado.nombre,
      ap_pat: usuarioActualizado.apPat || null,
      ap_mat: usuarioActualizado.apMat || null,
      telefono: usuarioActualizado.telefono || null,
      password: usuarioActualizado.password || undefined,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errores?.usuario || error.mensaje || 'Error al actualizar usuario')
  }

  const json = await response.json()
  const usuarioMod = json.data

  return normalizarUsuario(usuarioMod)
}

export async function eliminarUsuario(id) {
  const response = await fetch(`${API_URL}/usuarios/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Error al eliminar usuario')
  }

  return true
}
