import * as medicamentosModel from '../models/medicamentosModel.js'
import { validarMedicamento } from '../validators/medicamentosValidator.js'

export async function listarMedicamentos(_req, res, next) {
  try {
    const medicamentos = await medicamentosModel.obtenerMedicamentos()
    res.json(medicamentos)
  } catch (error) {
    next(error)
  }
}

export async function registrarMedicamento(req, res, next) {
  try {
    const validacion = validarMedicamento(req.body)

    if (!validacion.valido) {
      return res.status(400).json({
        mensaje: 'Datos de medicamento invalidos.',
        errores: validacion.errores,
      })
    }

    const medicamento = await medicamentosModel.crearMedicamento(validacion.datosLimpios)
    return res.status(201).json(medicamento)
  } catch (error) {
    return next(error)
  }
}
