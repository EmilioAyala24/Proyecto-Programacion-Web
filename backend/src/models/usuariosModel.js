import { pool } from '../config/database.js'

const DESFASE_UTC_MEXICO_CENTRO_MS = 6 * 60 * 60 * 1000
const FORMATO_FECHA_HORA = 'DD-MM-YYYY  |  HH24:MI:SS'

function obtenerFechaHoraMexico() {
  const fechaUtcMenosSeis = new Date(Date.now() - DESFASE_UTC_MEXICO_CENTRO_MS)
  const partes = {
    year: fechaUtcMenosSeis.getUTCFullYear(),
    month: String(fechaUtcMenosSeis.getUTCMonth() + 1).padStart(2, '0'),
    day: String(fechaUtcMenosSeis.getUTCDate()).padStart(2, '0'),
    hour: String(fechaUtcMenosSeis.getUTCHours()).padStart(2, '0'),
    minute: String(fechaUtcMenosSeis.getUTCMinutes()).padStart(2, '0'),
    second: String(fechaUtcMenosSeis.getUTCSeconds()).padStart(2, '0'),
  }

  return `${partes.year}-${partes.month}-${partes.day} ${partes.hour}:${partes.minute}:${partes.second}`
}

export async function obtenerUsuarios() {
  const resultado = await pool.query(
    `SELECT
       id_usuario,
       usuario,
       rol,
       TO_CHAR(fecha_creacion, '${FORMATO_FECHA_HORA}') AS fecha_creacion,
       TO_CHAR(ultima_conexion, '${FORMATO_FECHA_HORA}') AS ultima_conexion,
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
    `SELECT
       id_usuario,
       usuario,
       rol,
       password_hash,
       TO_CHAR(fecha_creacion, '${FORMATO_FECHA_HORA}') AS fecha_creacion,
       TO_CHAR(ultima_conexion, '${FORMATO_FECHA_HORA}') AS ultima_conexion,
       nombre,
       ap_pat,
       ap_mat,
       telefono
     FROM usuario
     WHERE id_usuario = $1`,
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
     VALUES ($1, $2, $3, $4::timestamp, $5, $6, $7, $8)
     RETURNING
       id_usuario,
       usuario,
       rol,
       TO_CHAR(fecha_creacion, '${FORMATO_FECHA_HORA}') AS fecha_creacion,
       TO_CHAR(ultima_conexion, '${FORMATO_FECHA_HORA}') AS ultima_conexion,
       nombre,
       ap_pat,
       ap_mat,
       telefono`,
    [
      usuario,
      rol,
      passwordHash,
      obtenerFechaHoraMexico(),
      nombre,
      apPat || null,
      apMat || null,
      telefono || null,
    ],
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
     RETURNING
       id_usuario,
       usuario,
       rol,
       TO_CHAR(fecha_creacion, '${FORMATO_FECHA_HORA}') AS fecha_creacion,
       TO_CHAR(ultima_conexion, '${FORMATO_FECHA_HORA}') AS ultima_conexion,
       nombre,
       ap_pat,
       ap_mat,
       telefono`,
    [usuario, rol, nombre, apPat || null, apMat || null, telefono || null, passwordHash, id],
  )

  return resultado.rows[0]
}

export async function registrarConexion(id) {
  const resultado = await pool.query(
    `UPDATE usuario
     SET ultima_conexion = $2::timestamp
     WHERE id_usuario = $1
     RETURNING
       id_usuario,
       TO_CHAR(ultima_conexion, '${FORMATO_FECHA_HORA}') AS ultima_conexion`,
    [id, obtenerFechaHoraMexico()],
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
