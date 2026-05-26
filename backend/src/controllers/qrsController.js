import * as qrsModel from '../models/qrsModel.js'

export async function obtenerQRLote(req, res, next) {
  try {
    const idLote = Number(req.params.id)

    if (!idLote || Number.isNaN(idLote)) {
      return res.status(400).json({ mensaje: 'El ID del lote debe ser valido.' })
    }

    const qr = await qrsModel.obtenerQRPorLote(idLote)

    if (!qr) {
      return res.status(404).json({ mensaje: 'Lote no encontrado.' })
    }

    return res.json({ data: qr })
  } catch (error) {
    return next(error)
  }
}

export async function obtenerDetalleQR(req, res, next) {
  try {
    const token = String(req.params.token ?? '').trim()

    if (!token) {
      return res.status(400).json({ mensaje: 'El token del QR es requerido.' })
    }

    const detalle = await qrsModel.registrarEscaneo(token)

    if (!detalle) {
      return res.status(404).json({ mensaje: 'QR no encontrado o inactivo.' })
    }

    return res.json({ data: detalle })
  } catch (error) {
    return next(error)
  }
}
