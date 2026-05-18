import { pool } from '../config/database.js'
import { crearLoteBase } from './lotesModel.js'

export async function obtenerMedicamentos() {
  const resultado = await pool.query(
    `SELECT
       m.id_med,
       m.nombre,
       m.presentacion,
       m.concentracion,
       m.presentacion AS contenido,
       m.requiere_receta,
       l.id_lote,
       l.stock_actual AS stock_disponible,
       l.precio_venta AS precio_unitario
     FROM medicamento m
     JOIN lote l ON l.id_lote = m.id_lote
     ORDER BY m.nombre ASC`,
  )

  return resultado.rows
}

async function obtenerProveedorDisponible(client) {
  const resultado = await client.query(
    `SELECT id_prov
     FROM proveedor
     ORDER BY id_prov ASC
     LIMIT 1`,
  )

  if (!resultado.rows[0]) {
    throw new Error('No hay proveedores registrados para crear el lote del medicamento.')
  }

  return resultado.rows[0].id_prov
}

function obtenerEstadoColorimetria(stockDisponible) {
  if (stockDisponible <= 0) {
    return 'sin_stock'
  }

  if (stockDisponible <= 10) {
    return 'rojo'
  }

  if (stockDisponible <= 50) {
    return 'amarillo'
  }

  return 'verde'
}

export async function crearMedicamento(datos) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const idProv = await obtenerProveedorDisponible(client)
    const lote = await crearLoteBase({
      client,
      idProv,
      stockActual: datos.stockDisponible,
      precioVenta: datos.precioUnitario,
    })

    const resultado = await client.query(
      `INSERT INTO medicamento (
         id_lote,
         nombre,
         presentacion,
         concentracion,
         requiere_receta,
         fecha_registro,
         estado_colorimetria
       )
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6)
       RETURNING id_med, id_lote, nombre, presentacion, concentracion, presentacion AS contenido, requiere_receta`,
      [
        lote.id_lote,
        datos.nombre,
        datos.contenido || datos.presentacion,
        datos.concentracion,
        datos.requiereReceta,
        obtenerEstadoColorimetria(datos.stockDisponible),
      ],
    )

    await client.query('COMMIT')

    return {
      ...resultado.rows[0],
      stock_disponible: datos.stockDisponible,
      precio_unitario: datos.precioUnitario,
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function actualizarMedicamento(id, datos) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const actual = await client.query(
      'SELECT id_lote FROM medicamento WHERE id_med = $1',
      [id],
    )

    if (!actual.rows[0]) {
      await client.query('ROLLBACK')
      return null
    }

    const idLote = actual.rows[0].id_lote

    const resultado = await client.query(
      `UPDATE medicamento
       SET nombre = $1,
           presentacion = $2,
           concentracion = $3,
           requiere_receta = $4,
           estado_colorimetria = $5
       WHERE id_med = $6
       RETURNING id_med, id_lote, nombre, presentacion, concentracion, presentacion AS contenido, requiere_receta`,
      [
        datos.nombre,
        datos.contenido || datos.presentacion,
        datos.concentracion,
        datos.requiereReceta,
        obtenerEstadoColorimetria(datos.stockDisponible),
        id,
      ],
    )

    await client.query(
      `UPDATE lote
       SET stock_actual = $1,
           precio_venta = $2,
           activo = CASE WHEN $1 <= 0 THEN FALSE ELSE TRUE END
       WHERE id_lote = $3`,
      [datos.stockDisponible, datos.precioUnitario, idLote],
    )

    await client.query('COMMIT')

    return {
      ...resultado.rows[0],
      stock_disponible: datos.stockDisponible,
      precio_unitario: datos.precioUnitario,
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function eliminarMedicamento(id) {
  const resultado = await pool.query(
    'DELETE FROM medicamento WHERE id_med = $1 RETURNING id_med',
    [id],
  )

  return resultado.rows[0]
}
