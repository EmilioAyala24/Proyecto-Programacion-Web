import { pool } from '../config/database.js'

export async function obtenerLotes() {
  const resultado = await pool.query(
    `SELECT
       l.id_lote,
       l.numero_lote AS codigo_lote,
       l.stock_actual AS stock_disponible,
       l.fecha_ingreso,
       l.fecha_caducidad,
       p.nombre AS nombre_proveedor,
       COALESCE(m.nombre, 'Sin medicamento') AS nombre_medicamento,
       CASE
         WHEN l.fecha_caducidad < CURRENT_DATE THEN 'Caducado'
         WHEN l.fecha_caducidad <= CURRENT_DATE + INTERVAL '60 days' THEN 'Proximo'
         ELSE 'Vigente'
       END AS estado
     FROM lote l
     JOIN proveedor p ON p.id_prov = l.id_prov
     LEFT JOIN medicamento m ON m.id_lote = l.id_lote
     ORDER BY l.fecha_caducidad ASC, l.numero_lote ASC`,
  )

  return resultado.rows
}

export async function crearLoteBase({ client = pool, idProv, stockActual }) {
  const resultado = await client.query(
    `INSERT INTO lote (
       id_prov,
       numero_lote,
       fecha_fabricacion,
       fecha_caducidad,
       fecha_ingreso,
       stock_actual,
       activo,
       fecha_compra,
       precio_compra,
       precio_venta
     )
     VALUES (
       $1,
       'AUTO-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISSMS'),
       CURRENT_DATE,
       CURRENT_DATE + INTERVAL '1 year',
       CURRENT_DATE,
       $2,
       TRUE,
       CURRENT_DATE,
       0,
       0
     )
     RETURNING id_lote`,
    [idProv, stockActual],
  )

  return resultado.rows[0]
}
