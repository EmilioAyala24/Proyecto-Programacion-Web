const LIMITES = {
  nombre: 120,
  presentacion: 80,
  concentracion: 60,
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

export function validarMedicamento(datos) {
  const contenido = datos.contenido ?? datos.presentacion

  const errores = {
    nombre: validarTexto(datos.nombre, 'El nombre', LIMITES.nombre),
    presentacion: validarTexto(datos.presentacion, 'La presentacion', LIMITES.presentacion),
    concentracion: validarTexto(datos.concentracion, 'La concentracion', LIMITES.concentracion),
    contenido: validarTexto(contenido, 'El contenido', LIMITES.presentacion),
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
    },
  }
}
