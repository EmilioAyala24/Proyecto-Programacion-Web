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
       l.stock_actual AS stock_disponible
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
       RETURNING id_med, nombre, presentacion, concentracion, presentacion AS contenido, requiere_receta`,
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
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
