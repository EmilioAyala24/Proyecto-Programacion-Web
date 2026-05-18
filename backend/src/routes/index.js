import { Router } from 'express'
import { verificarConexion } from '../config/database.js'
import clientesRoutes from './clientesRoutes.js'
import lotesRoutes from './lotesRoutes.js'
import medicamentosRoutes from './medicamentosRoutes.js'
import proveedoresRoutes from './proveedoresRoutes.js'
import usuariosRoutes from './usuariosRoutes.js'
import ventasRoutes from './ventasRoutes.js'

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

router.use('/clientes', clientesRoutes)
router.use('/usuarios', usuariosRoutes)
router.use('/proveedores', proveedoresRoutes)
router.use('/medicamentos', medicamentosRoutes)
router.use('/lotes', lotesRoutes)
router.use('/ventas', ventasRoutes)

export default router
