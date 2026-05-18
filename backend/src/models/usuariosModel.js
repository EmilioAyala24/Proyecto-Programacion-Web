import { pool } from '../config/database.js'

export async function obtenerUsuarios() {
  const resultado = await pool.query(
    `SELECT
       id_usuario,
       usuario,
       rol,
       fecha_creacion,
       ultima_conexion,
       nombre,
       ap_pat,
       ap_mat,
       telefono
     FROM usuario
     ORDER BY fecha_creacion DESC, id_usuario DESC`,
  )

  return resultado.rows
}

export async function obtenerUsuarioPorId(id) {
  const resultado = await pool.query(
    'SELECT * FROM usuario WHERE id_usuario = $1',
    [id],
  )

  return resultado.rows[0]
}

export async function crearUsuario(usuario, rol, nombre, apPat, apMat, telefono) {
  const resultado = await pool.query(
    `INSERT INTO usuario (usuario, rol, fecha_creacion, nombre, ap_pat, ap_mat, telefono)
     VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6)
     RETURNING id_usuario, usuario, rol, fecha_creacion, ultima_conexion, nombre, ap_pat, ap_mat, telefono`,
    [usuario, rol, nombre, apPat || null, apMat || null, telefono || null],
  )

  return resultado.rows[0]
}

export async function actualizarUsuario(id, usuario, rol, nombre, apPat, apMat, telefono) {
  const resultado = await pool.query(
    `UPDATE usuario
     SET usuario = $1, rol = $2, nombre = $3, ap_pat = $4, ap_mat = $5, telefono = $6
     WHERE id_usuario = $7
     RETURNING id_usuario, usuario, rol, fecha_creacion, ultima_conexion, nombre, ap_pat, ap_mat, telefono`,
    [usuario, rol, nombre, apPat || null, apMat || null, telefono || null, id],
  )

  return resultado.rows[0]
}

export async function eliminarUsuario(id) {
  const resultado = await pool.query(
    'DELETE FROM usuario WHERE id_usuario = $1 RETURNING id_usuario',
    [id],
  )

  return resultado.rows[0]
}
