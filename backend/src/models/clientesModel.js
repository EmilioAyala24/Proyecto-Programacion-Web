import { pool } from '../config/database.js'

export async function obtenerClientes() {
  const resultado = await pool.query(
    `SELECT
       id_cliente,
       nombre,
       ap_pat,
       ap_mat,
       fecha_registro,
       telefono
     FROM cliente
     ORDER BY fecha_registro DESC, id_cliente DESC`,
  )

  return resultado.rows
}

export async function obtenerClientePorId(id) {
  const resultado = await pool.query(
    'SELECT * FROM cliente WHERE id_cliente = $1',
    [id],
  )

  return resultado.rows[0]
}

export async function crearCliente(nombre, apPat, apMat, telefono) {
  const resultado = await pool.query(
    `INSERT INTO cliente (nombre, ap_pat, ap_mat, fecha_registro, telefono)
     VALUES ($1, $2, $3, CURRENT_DATE, $4)
     RETURNING id_cliente, nombre, ap_pat, ap_mat, fecha_registro, telefono`,
    [nombre, apPat || null, apMat || null, telefono || null],
  )

  return resultado.rows[0]
}

export async function actualizarCliente(id, nombre, apPat, apMat, telefono) {
  const resultado = await pool.query(
    `UPDATE cliente
     SET nombre = $1, ap_pat = $2, ap_mat = $3, telefono = $4
     WHERE id_cliente = $5
     RETURNING id_cliente, nombre, ap_pat, ap_mat, fecha_registro, telefono`,
    [nombre, apPat || null, apMat || null, telefono || null, id],
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
