const LIMITES = {
  nombre: 120,
  presentacion: 80,
  concentracion: 60,
  stock: 999999,
  precio: 99999999.99,
}

const patronTextoFarmacia = /^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ0-9 .,+/%()-]+$/

function validarTexto(valor, campo, maximo) {
  const texto = valor?.trim() ?? ''

  if (!texto) {
    return `${campo} es obligatorio.`
  }

  if (texto.length < 2) {
    return `${campo} debe tener al menos 2 caracteres.`
  }

  if (texto.length > maximo) {
    return `${campo} no puede exceder ${maximo} caracteres.`
  }

  if (!patronTextoFarmacia.test(texto)) {
    return `${campo} contiene caracteres no permitidos.`
  }

  return ''
}

function validarEntero(valor, campo) {
  const numero = Number(valor)

  if (valor === '' || valor === null || Number.isNaN(numero)) {
    return `${campo} es obligatorio.`
  }

  if (!Number.isInteger(numero)) {
    return `${campo} debe ser un numero entero.`
  }

  if (numero < 0) {
    return `${campo} debe ser mayor o igual a cero.`
  }

  if (numero > LIMITES.stock) {
    return `${campo} no puede exceder ${LIMITES.stock}.`
  }

  return ''
}

function validarPrecio(valor, campo) {
  const numero = Number(valor)

  if (valor === '' || valor === null || Number.isNaN(numero)) {
    return `${campo} es obligatorio.`
  }

  if (numero < 0) {
    return `${campo} debe ser mayor o igual a cero.`
  }

  if (numero > LIMITES.precio) {
    return `${campo} es demasiado alto.`
  }

  if (!/^\d+(\.\d{1,2})?$/.test(String(valor))) {
    return `${campo} solo admite hasta 2 decimales.`
  }

  return ''
}

export function validarMedicamento(datos) {
  const stockDisponible = Number(datos.stockDisponible ?? datos.stock_disponible)
  const precioUnitario = Number(datos.precioUnitario ?? datos.precio_unitario ?? 0)
  const contenido = datos.contenido ?? datos.presentacion

  const errores = {
    nombre: validarTexto(datos.nombre, 'El nombre', LIMITES.nombre),
    presentacion: validarTexto(datos.presentacion, 'La presentacion', LIMITES.presentacion),
    concentracion: validarTexto(datos.concentracion, 'La concentracion', LIMITES.concentracion),
    contenido: validarTexto(contenido, 'El contenido', LIMITES.presentacion),
    stockDisponible: validarEntero(
      datos.stockDisponible ?? datos.stock_disponible,
      'El stock',
    ),
    precioUnitario: validarPrecio(
      datos.precioUnitario ?? datos.precio_unitario ?? 0,
      'El precio unitario',
    ),
  }

  Object.keys(errores).forEach((llave) => {
    if (!errores[llave]) {
      delete errores[llave]
    }
  })

  return {
    valido: Object.keys(errores).length === 0,
    errores,
    datosLimpios: {
      nombre: datos.nombre?.trim(),
      presentacion: datos.presentacion?.trim(),
      concentracion: datos.concentracion?.trim(),
      contenido: contenido?.trim(),
      requiereReceta: Boolean(datos.requiereReceta ?? datos.requiere_receta),
      stockDisponible,
      precioUnitario,
    },
  }
}
