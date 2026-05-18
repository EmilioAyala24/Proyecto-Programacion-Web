import * as lotesModel from '../models/lotesModel.js'

export async function listarLotes(_req, res, next) {
  try {
    const lotes = await lotesModel.obtenerLotes()
    res.json(lotes)
  } catch (error) {
    next(error)
  }
}
