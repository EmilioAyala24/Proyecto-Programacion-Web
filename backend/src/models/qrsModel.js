import crypto from 'crypto'
import { pool } from '../config/database.js'

const consultaDetalleQR = `
  SELECT
    qr.id_qr,
    qr.token,
    qr.url_qr,
    qr.fecha_generacion,
    qr.fecha_regeneracion,
    qr.contador_escaneos,
    qr.activo,
    l.id_lote,
    l.numero_lote,
    l.fecha_fabricacion,
    l.fecha_caducidad,
    l.fecha_ingreso,
    l.stock_actual,
    l.precio_venta,
    p.id_prov,
    p.nombre AS proveedor_nombre,
    m.id_med,
    m.nombre AS medicamento_nombre,
    m.presentacion,
    m.concentracion,
    m.contenido,
    m.requiere_receta
  FROM codigos_qr qr
  JOIN lote l ON l.id_lote = qr.id_lote
  JOIN proveedor p ON p.id_prov = l.id_prov
  JOIN medicamento m ON m.id_med = l.id_med
`

function crearToken() {
  return crypto.randomBytes(18).toString('hex')
}

function crearUrlQR(token) {
  const baseFrontend = process.env.APP_PUBLIC_URL || process.env.FRONTEND_URL || 'http://localhost:5173'
  return `${baseFrontend.replace(/\/$/, '')}/qr/${token}`
}

function crearUrlImagenQR(urlQR) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(urlQR)}`
}

export async function obtenerQRPorLote(idLote) {
  const loteResultado = await pool.query(
    `SELECT id_lote, id_med
     FROM lote
     WHERE id_lote = $1`,
    [idLote],
  )
  const lote = loteResultado.rows[0]

  if (!lote) {
    return null
  }

  let qrResultado = await pool.query(
    `SELECT id_qr, token, url_qr, fecha_generacion, fecha_regeneracion, contador_escaneos, activo
     FROM codigos_qr
     WHERE id_lote = $1
       AND activo = TRUE
     ORDER BY id_qr DESC
     LIMIT 1`,
    [idLote],
  )

  if (!qrResultado.rows[0]) {
    const token = crearToken()
    const urlQR = crearUrlQR(token)

    qrResultado = await pool.query(
      `INSERT INTO codigos_qr (
         id_medicamento,
         id_lote,
         token,
         url_qr,
         fecha_generacion,
         activo
       )
       VALUES ($1, $2, $3, $4, CURRENT_DATE, TRUE)
       RETURNING id_qr, token, url_qr, fecha_generacion, fecha_regeneracion, contador_escaneos, activo`,
      [lote.id_med, idLote, token, urlQR],
    )
  }

  const qr = qrResultado.rows[0]

  return {
    ...qr,
    id_lote: lote.id_lote,
    id_medicamento: lote.id_med,
    qr_image_url: crearUrlImagenQR(qr.url_qr),
  }
}

export async function obtenerDetallePorToken(token) {
  const resultado = await pool.query(
    `${consultaDetalleQR}
     WHERE qr.token = $1
       AND qr.activo = TRUE`,
    [token],
  )

  return resultado.rows[0]
}

export async function registrarEscaneo(token) {
  await pool.query(
    `UPDATE codigos_qr
     SET contador_escaneos = COALESCE(contador_escaneos, 0) + 1,
         fecha_regeneracion = COALESCE(fecha_regeneracion, fecha_generacion)
     WHERE token = $1
       AND activo = TRUE`,
    [token],
  )

  return obtenerDetallePorToken(token)
}
