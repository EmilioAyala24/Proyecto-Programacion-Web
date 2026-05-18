const patronTextoFarmacia = /^[a-zA-Z0-9 .,+/%-]+$/

function validarTexto(valor, campo) {
  const texto = valor?.trim() ?? ''

  if (!texto) {
    return `${campo} es obligatorio.`
  }

  if (texto.length < 2 || !patronTextoFarmacia.test(texto)) {
    return `${campo} contiene caracteres no permitidos.`
  }

  return ''
}

export function validarMedicamento(datos) {
  const errores = {
    nombre: validarTexto(datos.nombre, 'El nombre'),
    presentacion: validarTexto(datos.presentacion, 'La presentacion'),
    concentracion: validarTexto(datos.concentracion, 'La concentracion'),
    contenido: validarTexto(datos.contenido, 'El contenido'),
  }
  const stockDisponible = Number(datos.stockDisponible ?? datos.stock_disponible)

  if (Number.isNaN(stockDisponible) || stockDisponible < 0) {
    errores.stockDisponible = 'El stock debe ser un numero mayor o igual a cero.'
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
      contenido: datos.contenido?.trim(),
      requiereReceta: Boolean(datos.requiereReceta ?? datos.requiere_receta),
      stockDisponible,
    },
  }
}
