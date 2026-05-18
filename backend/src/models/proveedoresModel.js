import { pool } from '../config/database.js'

export async function obtenerProveedores() {
  const resultado = await pool.query(
    `SELECT id_prov, telefono, nombre, correo, direccion
     FROM proveedor
     ORDER BY nombre ASC`,
  )

  return resultado.rows
}

export async function crearProveedor({ nombre, telefono, correo, direccion }) {
  const resultado = await pool.query(
    `INSERT INTO proveedor (nombre, telefono, correo, direccion)
     VALUES ($1, $2, $3, $4)
     RETURNING id_prov, telefono, nombre, correo, direccion`,
    [nombre, telefono, correo, direccion],
  )

  return resultado.rows[0]
}

export async function actualizarProveedor(id, { nombre, telefono, correo, direccion }) {
  const resultado = await pool.query(
    `UPDATE proveedor
     SET nombre = $1, telefono = $2, correo = $3, direccion = $4
     WHERE id_prov = $5
     RETURNING id_prov, telefono, nombre, correo, direccion`,
    [nombre, telefono, correo, direccion, id],
  )

  return resultado.rows[0]
}

export async function eliminarProveedor(id) {
  const resultado = await pool.query(
    'DELETE FROM proveedor WHERE id_prov = $1 RETURNING id_prov',
    [id],
  )

  return resultado.rows[0]
}
