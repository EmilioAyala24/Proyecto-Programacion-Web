const API_URL = import.meta.env.VITE_API_URL

export async function obtenerUsuarios() {
  const response = await fetch(`${API_URL}/usuarios`)

  if (!response.ok) {
    throw new Error('Error al obtener usuarios')
  }

  const json = await response.json()
  return json.data.map((usuario) => ({
    id: usuario.id_usuario,
    usuario: usuario.usuario,
    rol: usuario.rol,
    nombre: usuario.nombre,
    apPat: usuario.ap_pat,
    apMat: usuario.ap_mat,
    telefono: usuario.telefono,
    fechaCreacion: usuario.fecha_creacion,
    ultimaConexion: usuario.ultima_conexion,
  }))
}

export async function obtenerUsuarioPorId(id) {
  const response = await fetch(`${API_URL}/usuarios/${id}`)

  if (!response.ok) {
    throw new Error('Error al obtener usuario')
  }

  const json = await response.json()
  const usuario = json.data

  return {
    id: usuario.id_usuario,
    usuario: usuario.usuario,
    rol: usuario.rol,
    nombre: usuario.nombre,
    apPat: usuario.ap_pat,
    apMat: usuario.ap_mat,
    telefono: usuario.telefono,
    fechaCreacion: usuario.fecha_creacion,
    ultimaConexion: usuario.ultima_conexion,
  }
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
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errores?.usuario || error.mensaje || 'Error al crear usuario')
  }

  const json = await response.json()
  const usuarioCreado = json.data

  return {
    id: usuarioCreado.id_usuario,
    usuario: usuarioCreado.usuario,
    rol: usuarioCreado.rol,
    nombre: usuarioCreado.nombre,
    apPat: usuarioCreado.ap_pat,
    apMat: usuarioCreado.ap_mat,
    telefono: usuarioCreado.telefono,
    fechaCreacion: usuarioCreado.fecha_creacion,
    ultimaConexion: usuarioCreado.ultima_conexion,
  }
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
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errores?.usuario || error.mensaje || 'Error al actualizar usuario')
  }

  const json = await response.json()
  const usuarioMod = json.data

  return {
    id: usuarioMod.id_usuario,
    usuario: usuarioMod.usuario,
    rol: usuarioMod.rol,
    nombre: usuarioMod.nombre,
    apPat: usuarioMod.ap_pat,
    apMat: usuarioMod.ap_mat,
    telefono: usuarioMod.telefono,
    fechaCreacion: usuarioMod.fecha_creacion,
    ultimaConexion: usuarioMod.ultima_conexion,
  }
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
