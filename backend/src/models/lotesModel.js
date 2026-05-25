import { pool } from '../config/database.js'

const consultaLotes = `
  SELECT
    l.id_lote,
    l.numero_lote AS codigo_lote,
    l.id_prov,
    l.id_med,
    l.fecha_fabricacion,
    l.stock_actual AS stock_disponible,
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

export async function obtenerLotes() {
  const resultado = await pool.query(
    `${consultaLotes}
     ORDER BY l.fecha_caducidad ASC, l.numero_lote ASC`,
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
         precio_venta = $10
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

export async function eliminarLote(id) {
  const resultado = await pool.query(
    'DELETE FROM lote WHERE id_lote = $1 RETURNING id_lote',
    [id],
  )

  return resultado.rows[0]
}
