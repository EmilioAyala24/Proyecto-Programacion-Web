import * as trazabilidadModel from '../models/trazabilidadModel.js'

function esFechaISO(valor) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(valor || ''))
}

export async function buscarCompradores(req, res, next) {
  try {
    const desde = req.query.desde
    const hasta = req.query.hasta
    const idMedicamento = req.query.idMedicamento ? Number(req.query.idMedicamento) : null
    const idLote = req.query.idLote ? Number(req.query.idLote) : null

    if (!esFechaISO(desde) || !esFechaISO(hasta)) {
      return res.status(400).json({ mensaje: 'Captura fechas válidas en desde y hasta.' })
    }

    if (new Date(`${desde}T00:00:00Z`) > new Date(`${hasta}T00:00:00Z`)) {
      return res.status(400).json({ mensaje: 'La fecha desde no puede ser posterior a la fecha hasta.' })
    }

    if (idMedicamento !== null && (!idMedicamento || Number.isNaN(idMedicamento))) {
      return res.status(400).json({ mensaje: 'Selecciona un medicamento válido.' })
    }

    if (idLote !== null && (!idLote || Number.isNaN(idLote))) {
      return res.status(400).json({ mensaje: 'Selecciona un lote válido.' })
    }

    const compradores = await trazabilidadModel.buscarCompradores({
      desde,
      hasta,
      idMedicamento,
      idLote,
    })

    return res.json({ data: compradores, total: compradores.length })
  } catch (error) {
    return next(error)
  }
}
