import { pool } from '../config/database.js'

export async function obtenerMedicamentos() {
  const resultado = await pool.query(
    `SELECT
       m.id_med,
       m.nombre,
       m.presentacion,
       m.concentracion,
       m.contenido,
       m.requiere_receta,
       COALESCE(SUM(l.stock_actual), 0)::INTEGER AS stock_disponible,
       COALESCE(MAX(l.precio_venta), 0) AS precio_unitario,
       COUNT(l.id_lote)::INTEGER AS total_lotes,
       COUNT(l.id_lote) FILTER (WHERE l.fecha_caducidad >= CURRENT_DATE + INTERVAL '61 days')::INTEGER AS lotes_vigentes,
       COUNT(l.id_lote) FILTER (
         WHERE l.fecha_caducidad >= CURRENT_DATE
           AND l.fecha_caducidad <= CURRENT_DATE + INTERVAL '60 days'
       )::INTEGER AS lotes_proximos,
       COUNT(l.id_lote) FILTER (WHERE l.fecha_caducidad < CURRENT_DATE)::INTEGER AS lotes_caducados,
       CASE
         WHEN COUNT(l.id_lote) FILTER (WHERE l.fecha_caducidad < CURRENT_DATE) > 0 THEN 'Caducado'
         WHEN COUNT(l.id_lote) FILTER (
           WHERE l.fecha_caducidad >= CURRENT_DATE
             AND l.fecha_caducidad <= CURRENT_DATE + INTERVAL '60 days'
         ) > 0 THEN 'Proximo'
         ELSE 'Vigente'
       END AS estado_lotes
     FROM medicamento m
     LEFT JOIN lote l ON l.id_med = m.id_med
     GROUP BY
       m.id_med,
       m.nombre,
       m.presentacion,
       m.concentracion,
       m.contenido,
       m.requiere_receta
     ORDER BY m.nombre ASC`,
  )

  return resultado.rows
}

export async function crearMedicamento(datos) {
  const resultado = await pool.query(
    `INSERT INTO medicamento (
       nombre,
       presentacion,
       concentracion,
       contenido,
       requiere_receta,
       fecha_registro,
       estado_colorimetria
     )
     VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 'sin_stock')
     RETURNING
       id_med,
       nombre,
       presentacion,
       concentracion,
       contenido,
       requiere_receta,
       0::INTEGER AS stock_disponible,
       0::NUMERIC AS precio_unitario,
       0::INTEGER AS total_lotes,
       0::INTEGER AS lotes_vigentes,
       0::INTEGER AS lotes_proximos,
       0::INTEGER AS lotes_caducados,
       'Vigente' AS estado_lotes`,
    [
      datos.nombre,
      datos.presentacion,
      datos.concentracion,
      datos.contenido,
      datos.requiereReceta,
    ],
  )

  return resultado.rows[0]
}

export async function actualizarMedicamento(id, datos) {
  const resultado = await pool.query(
    `UPDATE medicamento
     SET nombre = $1,
         presentacion = $2,
         concentracion = $3,
         contenido = $4,
         requiere_receta = $5
     WHERE id_med = $6
     RETURNING id_med`,
    [
      datos.nombre,
      datos.presentacion,
      datos.concentracion,
      datos.contenido,
      datos.requiereReceta,
      id,
    ],
  )

  if (!resultado.rows[0]) {
    return null
  }

  const medicamentos = await obtenerMedicamentos()
  return medicamentos.find((medicamento) => medicamento.id_med === Number(id))
}

export async function eliminarMedicamento(id) {
  const resultado = await pool.query(
    'DELETE FROM medicamento WHERE id_med = $1 RETURNING id_med',
    [id],
  )

  return resultado.rows[0]
}
