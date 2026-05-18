import { pool } from '../config/database.js'

export async function obtenerLotes() {
  const resultado = await pool.query(
    `SELECT
       l.id_lote,
       l.numero_lote AS codigo_lote,
       l.id_prov,
       l.fecha_fabricacion,
       l.stock_actual AS stock_disponible,
       l.fecha_ingreso,
       l.fecha_caducidad,
       l.precio_compra,
       l.precio_venta,
       m.id_med,
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

export async function crearLoteBase({
  client = pool,
  idProv,
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
       COALESCE($3, 'AUTO-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISSMS')),
       COALESCE($4, CURRENT_DATE),
       COALESCE($5, CURRENT_DATE + INTERVAL '1 year'),
       COALESCE($6, CURRENT_DATE),
       $2,
       TRUE,
       COALESCE($7, CURRENT_DATE),
       COALESCE($8, 0),
       COALESCE($9, 0)
     )
     RETURNING id_lote, numero_lote AS codigo_lote`,
    [
      idProv,
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

async function copiarMedicamentoEnLote(client, idMedicamento, idLote, stockActual) {
  if (!idMedicamento) {
    return
  }

  const base = await client.query(
    `SELECT nombre, presentacion, concentracion, requiere_receta
     FROM medicamento
     WHERE id_med = $1`,
    [idMedicamento],
  )

  if (!base.rows[0]) {
    throw new Error('El medicamento seleccionado no existe.')
  }

  const medicamento = base.rows[0]

  await client.query(
    `INSERT INTO medicamento (
       id_lote,
       nombre,
       presentacion,
       concentracion,
       requiere_receta,
       fecha_registro,
       estado_colorimetria
     )
     VALUES (
       $1,
       $2,
       $3,
       $4,
       $5,
       CURRENT_DATE,
       CASE
         WHEN $6 <= 0 THEN 'sin_stock'
         WHEN $6 <= 10 THEN 'rojo'
         WHEN $6 <= 50 THEN 'amarillo'
         ELSE 'verde'
       END
     )`,
    [
      idLote,
      medicamento.nombre,
      medicamento.presentacion,
      medicamento.concentracion,
      medicamento.requiere_receta,
      stockActual,
    ],
  )
}

async function actualizarMedicamentoDelLote(idMedicamentoOrigen, idLote, stockActual) {
  if (!idMedicamentoOrigen) {
    return
  }

  const resultado = await pool.query(
    `UPDATE medicamento AS destino
     SET nombre = origen.nombre,
         presentacion = origen.presentacion,
         concentracion = origen.concentracion,
         requiere_receta = origen.requiere_receta,
         estado_colorimetria = CASE
           WHEN $3 <= 0 THEN 'sin_stock'
           WHEN $3 <= 10 THEN 'rojo'
           WHEN $3 <= 50 THEN 'amarillo'
           ELSE 'verde'
         END
     FROM medicamento AS origen
     WHERE destino.id_lote = $1
       AND origen.id_med = $2
     RETURNING destino.id_med`,
    [idLote, idMedicamentoOrigen, stockActual],
  )

  if (!resultado.rows[0]) {
    await copiarMedicamentoEnLote(pool, idMedicamentoOrigen, idLote, stockActual)
  }
}

export async function crearLote(datos) {
  const client = await pool.connect()
  let idLoteCreado

  try {
    await client.query('BEGIN')

    const lote = await crearLoteBase({
      client,
      idProv: datos.idProv,
      stockActual: datos.stockActual,
      numeroLote: datos.numeroLote,
      fechaFabricacion: datos.fechaFabricacion,
      fechaCaducidad: datos.fechaCaducidad,
      fechaIngreso: datos.fechaIngreso,
      fechaCompra: datos.fechaCompra,
      precioCompra: datos.precioCompra,
      precioVenta: datos.precioVenta,
    })

    await copiarMedicamentoEnLote(client, datos.idMedicamento, lote.id_lote, datos.stockActual)
    idLoteCreado = lote.id_lote

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }

  const resultado = await pool.query(
    `SELECT
       l.id_lote,
       l.numero_lote AS codigo_lote,
       l.id_prov,
       l.fecha_fabricacion,
       l.stock_actual AS stock_disponible,
       l.fecha_ingreso,
       l.fecha_caducidad,
       l.precio_compra,
       l.precio_venta,
       m.id_med,
       p.nombre AS nombre_proveedor,
       COALESCE(m.nombre, 'Sin medicamento') AS nombre_medicamento
     FROM lote l
     JOIN proveedor p ON p.id_prov = l.id_prov
     LEFT JOIN medicamento m ON m.id_lote = l.id_lote
     WHERE l.id_lote = $1`,
    [idLoteCreado],
  )

  return resultado.rows[0]
}

export async function actualizarLote(id, datos) {
  const resultado = await pool.query(
    `UPDATE lote
     SET id_prov = $1,
         numero_lote = $2,
         fecha_fabricacion = $3,
         fecha_caducidad = $4,
         fecha_ingreso = $5,
         stock_actual = $6,
         fecha_compra = $7,
         precio_compra = $8,
         precio_venta = $9
     WHERE id_lote = $10
     RETURNING id_lote`,
    [
      datos.idProv,
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

  await actualizarMedicamentoDelLote(datos.idMedicamento, id, datos.stockActual)

  const lotes = await obtenerLotes()
  return lotes.find((lote) => lote.id_lote === Number(id))
}

export async function eliminarLote(id) {
  const resultado = await pool.query(
    'DELETE FROM lote WHERE id_lote = $1 RETURNING id_lote',
    [id],
  )

  return resultado.rows[0]
}
