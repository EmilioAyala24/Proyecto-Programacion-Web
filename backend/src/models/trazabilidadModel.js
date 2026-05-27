import { pool } from '../config/database.js'

export async function buscarCompradores({ desde, hasta, idMedicamento, idLote }) {
  const filtros = [
    `v.fecha_venta >= $1::date`,
    `v.fecha_venta < ($2::date + INTERVAL '1 day')`,
  ]
  const valores = [desde, hasta]

  if (idMedicamento) {
    valores.push(idMedicamento)
    filtros.push(`dvm.id_medicamento = $${valores.length}`)
  }

  if (idLote) {
    valores.push(idLote)
    filtros.push(`dvm.id_lote = $${valores.length}`)
  }

  const resultado = await pool.query(
    `SELECT
       v.id_ventas,
       TO_CHAR(v.fecha_venta, 'DD-MM-YYYY | HH24:MI:SS') AS fecha_venta,
       c.id_cliente,
       CASE
         WHEN c.id_cliente IS NULL THEN 'Publico general'
         ELSE CONCAT_WS(' ', c.nombre, c.ap_pat, c.ap_mat)
       END AS cliente_nombre,
       c.telefono,
       c.correo,
       m.id_med,
       m.nombre AS medicamento_nombre,
       m.presentacion,
       m.concentracion,
       l.id_lote,
       l.numero_lote,
       l.motivo_oculto,
       dvm.cantidad,
       dvm.subtotal
     FROM detalle_ventas_medicamento dvm
     JOIN ventas v ON v.id_ventas = dvm.id_ventas
     JOIN medicamento m ON m.id_med = dvm.id_medicamento
     LEFT JOIN lote l ON l.id_lote = dvm.id_lote
     LEFT JOIN cliente c ON c.id_cliente = v.id_cliente
     WHERE ${filtros.join(' AND ')}
     ORDER BY v.fecha_venta DESC, v.id_ventas DESC`,
    valores,
  )

  return resultado.rows
}
