import { pool } from '../config/database.js'

export async function obtenerVentas() {
  const resultado = await pool.query(
    `SELECT
       v.id_ventas,
       v.fecha_venta,
       v.total_venta,
       u.nombre AS usuario_nombre,
       mp.nombre_metodo,
       CASE
         WHEN c.id_cliente IS NULL THEN 'Publico general'
         ELSE CONCAT_WS(' ', c.nombre, c.ap_pat, c.ap_mat)
       END AS cliente_nombre,
       COALESCE(SUM(dvm.cantidad), 0)::INTEGER AS cantidad_medicamentos
     FROM ventas v
     JOIN usuario u ON v.id_usuario = u.id_usuario
     JOIN metodo_pago mp ON v.id_metPag = mp.id_metPag
     LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
     LEFT JOIN detalle_ventas_medicamento dvm ON v.id_ventas = dvm.id_ventas
     GROUP BY v.id_ventas, v.fecha_venta, v.total_venta, u.nombre, mp.nombre_metodo, c.id_cliente
     ORDER BY v.fecha_venta DESC, v.id_ventas DESC`,
  )

  return resultado.rows
}

export async function obtenerDetalleVenta(idVentas) {
  const resultado = await pool.query(
    `SELECT
       dvm.id_detalle,
       m.nombre AS medicamento_nombre,
       m.presentacion,
       m.concentracion,
       dvm.cantidad,
       dvm.precio_unitario,
       dvm.subtotal
     FROM detalle_ventas_medicamento dvm
     JOIN medicamento m ON dvm.id_medicamento = m.id_med
     WHERE dvm.id_ventas = $1
     ORDER BY dvm.id_detalle`,
    [idVentas],
  )

  return resultado.rows
}

export async function crearVenta(idUsuario, idMetPag, idCliente, detalles) {
  const cliente = await pool.connect()

  try {
    await cliente.query('BEGIN')

    const total = detalles.reduce(
      (sum, item) => sum + Number(item.cantidad) * Number(item.precio_unitario),
      0,
    )
    const resultadoVenta = await cliente.query(
      `INSERT INTO ventas (id_usuario, id_metPag, id_cliente, fecha_venta, total_venta)
       VALUES ($1, $2, $3, NOW(), $4)
       RETURNING id_ventas`,
      [idUsuario, idMetPag, idCliente || null, total],
    )
    const idVentas = resultadoVenta.rows[0].id_ventas

    for (const detalle of detalles) {
      const medicamentoResultado = await cliente.query(
        `SELECT m.id_lote, l.stock_actual
         FROM medicamento m
         JOIN lote l ON l.id_lote = m.id_lote
         WHERE m.id_med = $1
         FOR UPDATE`,
        [detalle.id_medicamento],
      )
      const medicamento = medicamentoResultado.rows[0]

      if (!medicamento) {
        throw new Error(`El medicamento ${detalle.id_medicamento} no existe.`)
      }

      if (Number(detalle.cantidad) > medicamento.stock_actual) {
        throw new Error(`Stock insuficiente para el medicamento ${detalle.id_medicamento}.`)
      }

      const subtotal = Number(detalle.cantidad) * Number(detalle.precio_unitario)

      await cliente.query(
        `INSERT INTO detalle_ventas_medicamento (
           id_ventas,
           id_medicamento,
           cantidad,
           precio_unitario,
           subtotal
         )
         VALUES ($1, $2, $3, $4, $5)`,
        [
          idVentas,
          detalle.id_medicamento,
          detalle.cantidad,
          detalle.precio_unitario,
          subtotal,
        ],
      )

      await cliente.query(
        `UPDATE lote
         SET stock_actual = stock_actual - $1,
             activo = CASE WHEN stock_actual - $1 <= 0 THEN FALSE ELSE activo END
         WHERE id_lote = $2`,
        [detalle.cantidad, medicamento.id_lote],
      )
    }

    await cliente.query('COMMIT')
    return { id_ventas: idVentas, total }
  } catch (error) {
    await cliente.query('ROLLBACK')
    throw error
  } finally {
    cliente.release()
  }
}

export async function obtenerMetodosPago() {
  const resultado = await pool.query(
    `SELECT id_metPag AS "id_metPag", nombre_metodo
     FROM metodo_pago
     ORDER BY nombre_metodo`,
  )

  return resultado.rows
}

export async function obtenerClientes() {
  const resultado = await pool.query(
    `SELECT id_cliente, nombre, ap_pat, ap_mat, telefono
     FROM cliente
     ORDER BY nombre`,
  )

  return resultado.rows
}

export async function obtenerMedicamentosDisponibles() {
  const resultado = await pool.query(
    `SELECT
       m.id_med,
       m.nombre,
       m.presentacion,
       m.concentracion,
       m.requiere_receta,
       l.stock_actual,
       l.precio_venta,
       l.id_lote
     FROM medicamento m
     JOIN lote l ON m.id_lote = l.id_lote
     WHERE l.stock_actual > 0
       AND l.activo = TRUE
       AND (l.fecha_caducidad IS NULL OR l.fecha_caducidad >= CURRENT_DATE)
     ORDER BY m.nombre`,
  )

  return resultado.rows
}
