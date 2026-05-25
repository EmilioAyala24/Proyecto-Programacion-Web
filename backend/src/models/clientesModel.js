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

export async function obtenerClientes() {
  const resultado = await pool.query(
    `SELECT
       id_cliente,
       nombre,
       ap_pat,
       ap_mat,
       TO_CHAR(fecha_registro, '${FORMATO_FECHA_HORA}') AS fecha_registro,
       telefono,
       correo
     FROM cliente
     ORDER BY fecha_registro DESC, id_cliente DESC`,
  )

  return resultado.rows
}

export async function obtenerClientePorId(id) {
  const resultado = await pool.query(
    `SELECT
       id_cliente,
       nombre,
       ap_pat,
       ap_mat,
       TO_CHAR(fecha_registro, '${FORMATO_FECHA_HORA}') AS fecha_registro,
       telefono,
       correo
     FROM cliente
     WHERE id_cliente = $1`,
    [id],
  )

  return resultado.rows[0]
}

export async function crearCliente(nombre, apPat, apMat, telefono, correo) {
  const resultado = await pool.query(
    `INSERT INTO cliente (nombre, ap_pat, ap_mat, fecha_registro, telefono, correo)
     VALUES ($1, $2, $3, $4::timestamp, $5, $6)
     RETURNING
       id_cliente,
       nombre,
       ap_pat,
       ap_mat,
       TO_CHAR(fecha_registro, '${FORMATO_FECHA_HORA}') AS fecha_registro,
       telefono,
       correo`,
    [nombre, apPat || null, apMat || null, obtenerFechaHoraMexico(), telefono || null, correo || null],
  )

  return resultado.rows[0]
}

export async function actualizarCliente(id, nombre, apPat, apMat, telefono, correo) {
  const resultado = await pool.query(
    `UPDATE cliente
     SET nombre = $1, ap_pat = $2, ap_mat = $3, telefono = $4, correo = $5
     WHERE id_cliente = $6
     RETURNING
       id_cliente,
       nombre,
       ap_pat,
       ap_mat,
       TO_CHAR(fecha_registro, '${FORMATO_FECHA_HORA}') AS fecha_registro,
       telefono,
       correo`,
    [nombre, apPat || null, apMat || null, telefono || null, correo || null, id],
  )

  return resultado.rows[0]
}

export async function eliminarCliente(id) {
  const resultado = await pool.query(
    'DELETE FROM cliente WHERE id_cliente = $1 RETURNING id_cliente',
    [id],
  )

  return resultado.rows[0]
}
