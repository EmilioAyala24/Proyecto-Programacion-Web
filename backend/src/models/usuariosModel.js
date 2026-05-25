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

export async function obtenerUsuarioPorUsername(usuario) {
  const resultado = await pool.query(
    `SELECT
       id_usuario,
       usuario,
       rol,
       password_hash,
       nombre,
       ap_pat,
       ap_mat,
       telefono
     FROM usuario
     WHERE usuario = $1`,
    [usuario],
  )

  return resultado.rows[0]
}

export async function crearUsuario(usuario, rol, nombre, apPat, apMat, telefono, passwordHash) {
  const resultado = await pool.query(
    `INSERT INTO usuario (usuario, rol, password_hash, fecha_creacion, nombre, ap_pat, ap_mat, telefono)
     VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6, $7)
     RETURNING id_usuario, usuario, rol, fecha_creacion, ultima_conexion, nombre, ap_pat, ap_mat, telefono`,
    [usuario, rol, passwordHash, nombre, apPat || null, apMat || null, telefono || null],
  )

  return resultado.rows[0]
}

export async function actualizarUsuario(id, usuario, rol, nombre, apPat, apMat, telefono, passwordHash) {
  const resultado = await pool.query(
    `UPDATE usuario
     SET usuario = $1,
         rol = $2,
         nombre = $3,
         ap_pat = $4,
         ap_mat = $5,
         telefono = $6,
         password_hash = COALESCE($7, password_hash)
     WHERE id_usuario = $8
     RETURNING id_usuario, usuario, rol, fecha_creacion, ultima_conexion, nombre, ap_pat, ap_mat, telefono`,
    [usuario, rol, nombre, apPat || null, apMat || null, telefono || null, passwordHash, id],
  )

  return resultado.rows[0]
}

export async function registrarConexion(id) {
  await pool.query(
    'UPDATE usuario SET ultima_conexion = NOW() WHERE id_usuario = $1',
    [id],
  )
}

export async function eliminarUsuario(id) {
  const resultado = await pool.query(
    'DELETE FROM usuario WHERE id_usuario = $1 RETURNING id_usuario',
    [id],
  )

  return resultado.rows[0]
}
