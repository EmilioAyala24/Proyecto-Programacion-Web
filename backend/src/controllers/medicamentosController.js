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

export async function actualizarMedicamento(req, res, next) {
  try {
    const validacion = validarMedicamento(req.body)

    if (!validacion.valido) {
      return res.status(400).json({
        mensaje: 'Datos de medicamento invalidos.',
        errores: validacion.errores,
      })
    }

    const medicamento = await medicamentosModel.actualizarMedicamento(
      Number(req.params.id),
      validacion.datosLimpios,
    )

    if (!medicamento) {
      return res.status(404).json({ mensaje: 'Medicamento no encontrado.' })
    }

    return res.json(medicamento)
  } catch (error) {
    return next(error)
  }
}

export async function eliminarMedicamento(req, res, next) {
  try {
    const medicamento = await medicamentosModel.eliminarMedicamento(Number(req.params.id))

    if (!medicamento) {
      return res.status(404).json({ mensaje: 'Medicamento no encontrado.' })
    }

    return res.json({ mensaje: 'Medicamento eliminado.' })
  } catch (error) {
    return next(error)
  }
}
