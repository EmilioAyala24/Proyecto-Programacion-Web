import { Router } from 'express'
import * as ventasController from '../controllers/ventasController.js'

const router = Router()

// Rutas de opciones (DEBEN IR PRIMERO)
router.get('/opciones/metodos-pago', ventasController.obtenerMetodosPago)
router.get('/opciones/clientes', ventasController.obtenerClientes)
router.get('/opciones/medicamentos', ventasController.obtenerMedicamentosDisponibles)

// Obtener todas las ventas
router.get('/', ventasController.listarVentas)

// Vista publica para QR del ticket
router.get('/public/:id', ventasController.obtenerTicketPublico)

// Obtener detalles de una venta (DEBE IR AL FINAL)
router.get('/:id', ventasController.obtenerVenta)

// Crear nueva venta
router.post('/', ventasController.crearVenta)

// Eliminar venta con autorización de administrador
router.delete('/:id', ventasController.eliminarVenta)

export default router
