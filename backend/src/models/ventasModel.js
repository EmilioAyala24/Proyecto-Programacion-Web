import { pool } from '../config/database.js'

const FORMATO_FECHA_HORA = 'DD-MM-YYYY  |  HH24:MI:SS'

export async function obtenerVentas() {
  const resultado = await pool.query(
    `SELECT
       v.id_ventas,
       TO_CHAR(v.fecha_venta, '${FORMATO_FECHA_HORA}') AS fecha_venta,
       TO_CHAR(v.fecha_venta, 'YYYY-MM-DD HH24:MI:SS') AS fecha_venta_iso,
       TO_CHAR(v.fecha_venta, 'YYYY-MM-DD') AS fecha_venta_dia,
       EXTRACT(HOUR FROM v.fecha_venta)::INTEGER AS fecha_venta_hora,
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

    const resultadoVenta = await cliente.query(
      `INSERT INTO ventas (id_usuario, id_metPag, id_cliente, fecha_venta, total_venta)
       VALUES ($1, $2, $3, NOW() AT TIME ZONE 'America/Mexico_City', 0)
       RETURNING id_ventas`,
      [idUsuario, idMetPag, idCliente || null],
    )
    const idVentas = resultadoVenta.rows[0].id_ventas
    let total = 0

    for (const detalle of detalles) {
      const medicamentoResultado = await cliente.query(
        `SELECT
           m.id_med,
           l.id_lote,
           l.stock_actual,
           COALESCE(l.precio_venta, 0) AS precio_venta
         FROM medicamento m
         JOIN lote l ON l.id_med = m.id_med
         WHERE m.id_med = $1
           AND l.id_lote = $2
           AND l.stock_actual > 0
           AND l.activo = TRUE
           AND (l.fecha_caducidad IS NULL OR l.fecha_caducidad >= CURRENT_DATE)
         FOR UPDATE`,
        [detalle.id_medicamento, detalle.id_lote],
      )
      const medicamento = medicamentoResultado.rows[0]

      if (!medicamento) {
        throw new Error('El lote seleccionado no existe o no esta disponible.')
      }

      if (Number(detalle.cantidad) > medicamento.stock_actual) {
        throw new Error(`Stock insuficiente para el lote ${detalle.id_lote}.`)
      }

      const precioUnitario = Number(medicamento.precio_venta)
      const subtotal = Number(detalle.cantidad) * precioUnitario
      total += subtotal

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
          precioUnitario,
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

    await cliente.query(
      'UPDATE ventas SET total_venta = $1 WHERE id_ventas = $2',
      [total, idVentas],
    )

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
  await pool.query(
    `INSERT INTO metodo_pago (nombre_metodo, descripcion)
     SELECT nombre_metodo, descripcion
     FROM (VALUES
       ('Efectivo', 'Pago en efectivo en mostrador'),
       ('Tarjeta de debito', 'Pago con tarjeta de debito'),
       ('Tarjeta de credito', 'Pago con tarjeta de credito'),
       ('Transferencia', 'Pago por transferencia bancaria'),
       ('CoDi', 'Pago digital CoDi')
     ) AS metodo(nombre_metodo, descripcion)
     WHERE NOT EXISTS (
       SELECT 1
       FROM metodo_pago mp
       WHERE LOWER(mp.nombre_metodo) = LOWER(metodo.nombre_metodo)
     )`,
  )

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
       l.id_lote,
       l.numero_lote,
       l.fecha_caducidad
     FROM medicamento m
     JOIN lote l ON l.id_med = m.id_med
     WHERE l.stock_actual > 0
       AND l.activo = TRUE
       AND (l.fecha_caducidad IS NULL OR l.fecha_caducidad >= CURRENT_DATE)
     ORDER BY m.nombre, l.fecha_caducidad ASC NULLS LAST, l.numero_lote`,
  )

  return resultado.rows
}
