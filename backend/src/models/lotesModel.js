import { pool } from '../config/database.js'

const consultaLotes = `
  SELECT
    l.id_lote,
    l.numero_lote AS codigo_lote,
    l.id_prov,
    l.id_med,
    l.fecha_fabricacion,
    l.stock_actual AS stock_disponible,
    l.oculto,
    l.motivo_oculto,
    l.fecha_oculto,
    l.fecha_ingreso,
    l.fecha_caducidad,
    l.precio_compra,
    l.precio_venta,
    p.nombre AS nombre_proveedor,
    COALESCE(m.nombre, 'Sin medicamento') AS nombre_medicamento,
    CASE
      WHEN l.fecha_caducidad < CURRENT_DATE THEN 'Caducado'
      WHEN l.fecha_caducidad <= CURRENT_DATE + INTERVAL '60 days' THEN 'Proximo'
      ELSE 'Vigente'
    END AS estado
  FROM lote l
  JOIN proveedor p ON p.id_prov = l.id_prov
  LEFT JOIN medicamento m ON m.id_med = l.id_med
`

async function ocultarLotesCaducados(client = pool) {
  await client.query(`
    UPDATE lote
    SET oculto = TRUE,
        activo = FALSE,
        motivo_oculto = COALESCE(motivo_oculto, 'Caducado'),
        fecha_oculto = COALESCE(fecha_oculto, NOW() AT TIME ZONE 'America/Mexico_City')
    WHERE fecha_caducidad < CURRENT_DATE
      AND oculto = FALSE
  `)
}

export async function obtenerLotes() {
  await ocultarLotesCaducados()

  const resultado = await pool.query(
    `${consultaLotes}
     WHERE l.oculto = FALSE
     ORDER BY l.fecha_caducidad ASC, l.numero_lote ASC`,
  )

  return resultado.rows
}

export async function obtenerLotesOcultos() {
  await ocultarLotesCaducados()

  const resultado = await pool.query(
    `${consultaLotes}
     WHERE l.oculto = TRUE
     ORDER BY l.fecha_oculto DESC NULLS LAST, l.fecha_caducidad ASC, l.numero_lote ASC`,
  )

  return resultado.rows
}

export async function crearLoteBase({
  client = pool,
  idProv,
  idMedicamento,
  stockActual,
  numeroLote,
  fechaFabricacion,
  fechaCaducidad,
  fechaIngreso,
  fechaCompra,
  precioCompra,
  precioVenta,
}) {
  const resultado = await client.query(
    `INSERT INTO lote (
       id_prov,
       id_med,
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
       $2,
       COALESCE($4, 'AUTO-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISSMS')),
       COALESCE($5, CURRENT_DATE),
       COALESCE($6, CURRENT_DATE + INTERVAL '1 year'),
       COALESCE($7, CURRENT_DATE),
       $3,
       CASE WHEN $3 <= 0 THEN FALSE ELSE TRUE END,
       COALESCE($8, CURRENT_DATE),
       COALESCE($9, 0::NUMERIC),
       COALESCE($10, 0::NUMERIC)
     )
     RETURNING id_lote, numero_lote AS codigo_lote`,
    [
      idProv,
      idMedicamento || null,
      stockActual,
      numeroLote || null,
      fechaFabricacion || null,
      fechaCaducidad || null,
      fechaIngreso || null,
      fechaCompra || null,
      precioCompra ?? null,
      precioVenta ?? null,
    ],
  )

  return resultado.rows[0]
}

async function obtenerLotePorId(idLote) {
  const resultado = await pool.query(
    `${consultaLotes}
     WHERE l.id_lote = $1`,
    [idLote],
  )

  return resultado.rows[0]
}

export async function crearLote(datos) {
  if (datos.idMedicamento) {
    const medicamento = await pool.query('SELECT id_med FROM medicamento WHERE id_med = $1', [
      datos.idMedicamento,
    ])

    if (!medicamento.rows[0]) {
      throw new Error('El medicamento seleccionado no existe.')
    }
  }

  const lote = await crearLoteBase({
    idProv: datos.idProv,
    idMedicamento: datos.idMedicamento,
    stockActual: datos.stockActual,
    numeroLote: datos.numeroLote,
    fechaFabricacion: datos.fechaFabricacion,
    fechaCaducidad: datos.fechaCaducidad,
    fechaIngreso: datos.fechaIngreso,
    fechaCompra: datos.fechaCompra,
    precioCompra: datos.precioCompra,
    precioVenta: datos.precioVenta,
  })

  return obtenerLotePorId(lote.id_lote)
}

export async function actualizarLote(id, datos) {
  if (datos.idMedicamento) {
    const medicamento = await pool.query('SELECT id_med FROM medicamento WHERE id_med = $1', [
      datos.idMedicamento,
    ])

    if (!medicamento.rows[0]) {
      throw new Error('El medicamento seleccionado no existe.')
    }
  }

  const resultado = await pool.query(
    `UPDATE lote
     SET id_prov = $1,
         id_med = $2,
         numero_lote = $3,
         fecha_fabricacion = $4,
         fecha_caducidad = $5,
         fecha_ingreso = $6,
         stock_actual = $7,
         activo = CASE WHEN $7 <= 0 THEN FALSE ELSE TRUE END,
         fecha_compra = $8,
         precio_compra = $9,
         precio_venta = $10,
         oculto = CASE WHEN $5 < CURRENT_DATE THEN TRUE ELSE oculto END,
         motivo_oculto = CASE WHEN $5 < CURRENT_DATE THEN COALESCE(motivo_oculto, 'Caducado') ELSE motivo_oculto END,
         fecha_oculto = CASE WHEN $5 < CURRENT_DATE THEN COALESCE(fecha_oculto, NOW() AT TIME ZONE 'America/Mexico_City') ELSE fecha_oculto END
     WHERE id_lote = $11
     RETURNING id_lote`,
    [
      datos.idProv,
      datos.idMedicamento || null,
      datos.numeroLote,
      datos.fechaFabricacion || null,
      datos.fechaCaducidad || null,
      datos.fechaIngreso || null,
      datos.stockActual,
      datos.fechaCompra || null,
      datos.precioCompra ?? null,
      datos.precioVenta ?? null,
      id,
    ],
  )

  if (!resultado.rows[0]) {
    return null
  }

  return obtenerLotePorId(id)
}

export async function ocultarLote(id, motivo = 'Oculto manualmente') {
  const resultado = await pool.query(
    `UPDATE lote
     SET oculto = TRUE,
         activo = FALSE,
         motivo_oculto = $2,
         fecha_oculto = NOW() AT TIME ZONE 'America/Mexico_City'
     WHERE id_lote = $1
     RETURNING id_lote`,
    [id, motivo || 'Oculto manualmente'],
  )

  return resultado.rows[0]
}

export async function eliminarLote(id) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const ventaRelacionada = await client.query(
      'SELECT 1 FROM detalle_ventas_medicamento WHERE id_lote = $1 LIMIT 1',
      [id],
    )

    if (ventaRelacionada.rows[0]) {
      const error = new Error('No se puede eliminar el lote porque ya fue usado en una venta.')
      error.statusCode = 409
      throw error
    }

    await client.query('DELETE FROM codigos_qr WHERE id_lote = $1', [id])
    await client.query('UPDATE medicamento SET id_lote = NULL WHERE id_lote = $1', [id])

    const resultado = await client.query(
      'DELETE FROM lote WHERE id_lote = $1 RETURNING id_lote',
      [id],
    )

    await client.query('COMMIT')
    return resultado.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
