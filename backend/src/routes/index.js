import { Router } from 'express'
import proveedoresRoutes from './proveedoresRoutes.js'

const router = Router()

router.get('/salud', (_req, res) => {
  res.json({ estado: 'ok', servicio: 'Farmacia Inclusiva API' })
})

router.use('/proveedores', proveedoresRoutes)

export default router
