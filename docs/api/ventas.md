# Módulo de Ventas

## Descripción
El módulo de ventas permite registrar y gestionar las transacciones de medicamentos en la farmacia. Proporciona funcionalidades para crear nuevas ventas, especificar detalles de los medicamentos vendidos y mantener un historial de todas las transacciones.

## Características principales

### 1. Registro de ventas
- Crear nuevas ventas de medicamentos
- Seleccionar cliente (opcional para ventas al público general)
- Elegir método de pago
- Agregar múltiples medicamentos a la venta
- Calcular automáticamente totales y subtotales

### 2. Gestión de medicamentos en venta
- Agregar medicamentos disponibles con stock
- Especificar cantidad y precio unitario
- Validación de stock disponible
- Eliminar medicamentos de la venta
- Visualización clara de medicamentos agregados

### 3. Historial de ventas
- Visualizar todas las ventas registradas
- Búsqueda y filtrado por:
  - ID de venta
  - Fecha
  - Usuario que realizó la venta
  - Cliente
  - Método de pago
  - Monto total

### 4. Indicadores clave
- Total de ventas realizadas
- Monto total de ventas
- Cantidad de medicamentos vendidos

## Estructura de archivos

### Backend
```
backend/src/
├── models/
│   └── ventasModel.js           # Funciones de base de datos
├── controllers/
│   └── ventasController.js      # Lógica de control de ventas
├── validators/
│   └── ventasValidator.js       # Validación de datos de ventas
└── routes/
    └── ventasRoutes.js          # Rutas de la API
```

### Frontend
```
src/
├── pages/
│   └── Ventas.jsx               # Página principal del módulo
├── components/
│   └── ventas/
│       ├── VentaForm.jsx        # Formulario de nueva venta
│       └── VentasTable.jsx      # Tabla de historial de ventas
├── services/
│   └── ventasService.js         # Servicio API para ventas
└── data/
    └── ventas.js                # Datos iniciales (fallback)
```

## Rutas de API

### Obtener todas las ventas
```
GET /api/ventas
```
Retorna lista de todas las ventas con resumen de detalles.

### Obtener detalles de una venta
```
GET /api/ventas/:id
```
Retorna los medicamentos incluidos en una venta específica.

### Crear nueva venta
```
POST /api/ventas
```
Cuerpo de la solicitud:
```json
{
  "id_usuario": 1,
  "id_metPag": 1,
  "id_cliente": 5,
  "detalles": [
    {
      "id_medicamento": 10,
      "cantidad": 2,
      "precio_unitario": 45.50,
      "subtotal": 91.00
    }
  ]
}
```

### Obtener métodos de pago
```
GET /api/ventas/opciones/metodos-pago
```

### Obtener clientes
```
GET /api/ventas/opciones/clientes
```

### Obtener medicamentos disponibles
```
GET /api/ventas/opciones/medicamentos
```

## Validaciones

### Venta
- Usuario requerido y válido
- Método de pago requerido y válido
- Debe contener al menos un medicamento

### Detalle de medicamento
- Medicamento requerido y válido
- Cantidad debe ser número entero positivo
- Precio unitario debe ser número positivo
- Subtotal no puede ser negativo
- Cantidad no puede exceder el stock disponible

## Base de datos

### Tabla: ventas
```sql
CREATE TABLE ventas (
    id_ventas   SERIAL          NOT NULL PRIMARY KEY,
    id_usuario  INTEGER         NOT NULL,
    id_metPag   INTEGER         NOT NULL,
    id_cliente  INTEGER         DEFAULT NULL,
    fecha_venta TIMESTAMP       DEFAULT NULL,
    total_venta NUMERIC(10,2)   DEFAULT NULL
);
```

### Tabla: detalle_ventas_medicamento
```sql
CREATE TABLE detalle_ventas_medicamento (
    id_detalle      SERIAL          NOT NULL PRIMARY KEY,
    id_ventas       INTEGER         NOT NULL,
    id_medicamento  INTEGER         NOT NULL,
    cantidad        INTEGER         DEFAULT NULL,
    precio_unitario NUMERIC(10,2)   DEFAULT NULL,
    subtotal        NUMERIC(10,2)   DEFAULT NULL
);
```

## Funcionalidades futuros posibles

1. **Impresión de recibos** - Generar recibos en PDF
2. **Estadísticas avanzadas** - Gráficos de ventas por período
3. **Devoluciones** - Registrar devoluciones de medicamentos
4. **Descuentos** - Aplicar descuentos a medicamentos o ventas
5. **Auditoría** - Registrar cambios y cancelaciones de ventas
6. **Reportes** - Generar reportes de ventas por usuario, período, etc.
7. **Integración de pagos** - Integración con pasarelas de pago
8. **Sincronización de stock** - Actualización en tiempo real del inventario

## Notas de implementación

- El módulo actualiza automáticamente el stock al registrar una venta
- Usa transacciones para garantizar la consistencia de datos
- El usuario debe estar autenticado para acceder al módulo
- Las rutas están protegidas por autenticación
- El formulario incluye validación de datos tanto en cliente como en servidor
