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
