import { Router } from 'express'
import { verificarConexion } from '../config/database.js'
import proveedoresRoutes from './proveedoresRoutes.js'

const router = Router()

router.get('/salud', async (_req, res, next) => {
  try {
    const baseDatos = await verificarConexion()
    res.json({
      estado: 'ok',
      servicio: 'Farmacia Inclusiva API',
      baseDatos: 'conectada',
      fechaBaseDatos: baseDatos.fecha_actual,
    })
  } catch (error) {
    next(error)
  }
})

router.use('/proveedores', proveedoresRoutes)

export default router
