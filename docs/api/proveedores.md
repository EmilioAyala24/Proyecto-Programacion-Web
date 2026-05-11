# Endpoints de proveedores

Base URL local sugerida: `http://localhost:3001/api`

## GET /proveedores

Obtiene el listado de proveedores registrados.

Respuesta `200 OK`:

```json
[
  {
    "id_prov": 1,
    "telefono": "3121457890",
    "nombre": "Distribuidora Salud Total",
    "correo": "contacto@saludtotal.mx",
    "direccion": "Av. Tecnologico 120, Colima, Col."
  }
]
```

## POST /proveedores

Registra un proveedor.

Cuerpo:

```json
{
  "nombre": "Distribuidora Salud Total",
  "telefono": "3121457890",
  "correo": "contacto@saludtotal.mx",
  "direccion": "Av. Tecnologico 120, Colima, Col."
}
```

Respuesta `201 Created`:

```json
{
  "id_prov": 1,
  "telefono": "3121457890",
  "nombre": "Distribuidora Salud Total",
  "correo": "contacto@saludtotal.mx",
  "direccion": "Av. Tecnologico 120, Colima, Col."
}
```

Respuesta `400 Bad Request`:

```json
{
  "mensaje": "Datos de proveedor invalidos.",
  "errores": {
    "correo": "El correo no tiene un formato valido."
  }
}
```
