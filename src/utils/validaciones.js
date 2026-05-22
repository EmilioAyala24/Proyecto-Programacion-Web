export const LIMITES = {
  usuario: 60,
  nombrePersona: 80,
  apellido: 60,
  telefono: 15,
  proveedor: 100,
  correo: 100,
  direccion: 200,
  medicamentoNombre: 120,
  presentacion: 80,
  concentracion: 60,
  contenido: 80,
  lote: 60,
  stock: 999999,
  precio: 99999999.99,
}

const patronUsuario = /^[a-zA-Z0-9._-]+$/
const patronNombrePersona = /^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/
const patronNombreProveedor = /^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ0-9 .,&'-]+$/
const patronTextoFarmacia = /^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ0-9 .,+/%()-]+$/
const patronCodigoLote = /^[a-zA-Z0-9._-]+$/
const patronTelefono = /^[0-9+\-\s()]+$/
const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const patronDireccion = /^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ0-9 .,#/()-]+$/

function limitar(valor, maximo) {
  return String(valor ?? '').slice(0, maximo)
}

export function limpiarEspacios(valor) {
  return String(valor ?? '').replace(/\s+/g, ' ')
}

export function sanitizarNombrePersona(valor, maximo = LIMITES.nombrePersona) {
  return limitar(limpiarEspacios(valor).replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s'-]/g, ''), maximo)
}

export function sanitizarUsuario(valor) {
  return limitar(String(valor ?? '').replace(/[^a-zA-Z0-9._-]/g, ''), LIMITES.usuario)
}

export function sanitizarTelefono(valor) {
  return limitar(String(valor ?? '').replace(/[^0-9+\-\s()]/g, ''), LIMITES.telefono)
}

export function sanitizarProveedor(valor) {
  return limitar(limpiarEspacios(valor).replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ0-9 .,&'-]/g, ''), LIMITES.proveedor)
}

export function sanitizarDireccion(valor) {
  return limitar(limpiarEspacios(valor).replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ0-9 .,#/()-]/g, ''), LIMITES.direccion)
}

export function sanitizarTextoFarmacia(valor, maximo = LIMITES.medicamentoNombre) {
  return limitar(limpiarEspacios(valor).replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ0-9 .,+/%()-]/g, ''), maximo)
}

export function sanitizarCodigoLote(valor) {
  return limitar(String(valor ?? '').toUpperCase().replace(/[^A-Z0-9._-]/g, ''), LIMITES.lote)
}

export function sanitizarEntero(valor) {
  return String(valor ?? '').replace(/\D/g, '').slice(0, 6)
}

export function sanitizarDecimal(valor) {
  const limpio = String(valor ?? '')
    .replace(',', '.')
    .replace(/[^0-9.]/g, '')
  const [enteros = '', decimales = ''] = limpio.split('.')
  return decimales.length > 0
    ? `${enteros.slice(0, 8)}.${decimales.slice(0, 2)}`
    : enteros.slice(0, 8)
}

export function validarUsuario(usuario) {
  const valor = usuario.trim()

  if (!valor) {
    return 'El usuario es obligatorio.'
  }

  if (valor.length < 3) {
    return 'El usuario debe tener al menos 3 caracteres.'
  }

  if (valor.length > LIMITES.usuario) {
    return `El usuario no puede exceder ${LIMITES.usuario} caracteres.`
  }

  if (!patronUsuario.test(valor)) {
    return 'Usa solo letras, numeros, punto, guion o guion bajo.'
  }

  return ''
}

export function obtenerReglasPassword(password) {
  return [
    {
      id: 'longitud',
      texto: 'Minimo 8 caracteres',
      valida: password.length >= 8,
    },
    {
      id: 'mayuscula',
      texto: 'Una letra mayuscula',
      valida: /[A-Z]/.test(password),
    },
    {
      id: 'minuscula',
      texto: 'Una letra minuscula',
      valida: /[a-z]/.test(password),
    },
    {
      id: 'numero',
      texto: 'Un numero',
      valida: /\d/.test(password),
    },
    {
      id: 'simbolo',
      texto: 'Un simbolo',
      valida: /[^a-zA-Z0-9]/.test(password),
    },
  ]
}

export function obtenerSeguridadPassword(password) {
  const reglas = obtenerReglasPassword(password)
  const cumplidas = reglas.filter((regla) => regla.valida).length

  if (!password) {
    return {
      nivel: 'Sin contrasena',
      clase: 'vacia',
      puntaje: 0,
      reglas,
    }
  }

  if (cumplidas <= 2) {
    return {
      nivel: 'Debil',
      clase: 'debil',
      puntaje: cumplidas,
      reglas,
    }
  }

  if (cumplidas < reglas.length) {
    return {
      nivel: 'Media',
      clase: 'media',
      puntaje: cumplidas,
      reglas,
    }
  }

  return {
    nivel: 'Segura',
    clase: 'segura',
    puntaje: cumplidas,
    reglas,
  }
}

export function validarPassword(password) {
  if (!password) {
    return 'La contrasena es obligatoria.'
  }

  const seguridad = obtenerSeguridadPassword(password)

  if (seguridad.puntaje < 3) {
    return 'La contrasena es demasiado debil.'
  }

  return ''
}

export function validarNombrePersona(nombre, campo = 'El nombre', maximo = LIMITES.nombrePersona) {
  const valor = nombre.trim()

  if (!valor) {
    return `${campo} es obligatorio.`
  }

  if (valor.length < 2) {
    return `${campo} debe tener al menos 2 caracteres.`
  }

  if (valor.length > maximo) {
    return `${campo} no puede exceder ${maximo} caracteres.`
  }

  if (!patronNombrePersona.test(valor)) {
    return `${campo} solo acepta letras, espacios, apostrofe o guion.`
  }

  return ''
}

export function validarProveedor(nombre) {
  const valor = nombre.trim()

  if (!valor) {
    return 'El nombre del proveedor es obligatorio.'
  }

  if (valor.length < 3) {
    return 'El nombre debe tener al menos 3 caracteres.'
  }

  if (valor.length > LIMITES.proveedor) {
    return `El nombre no puede exceder ${LIMITES.proveedor} caracteres.`
  }

  if (!patronNombreProveedor.test(valor)) {
    return 'Usa solo letras, numeros, espacios, punto, coma, &, apostrofe o guion.'
  }

  return ''
}

export function validarTelefono(telefono, obligatorio = true) {
  const valor = telefono.trim()

  if (!valor) {
    return obligatorio ? 'El telefono es obligatorio.' : ''
  }

  const digitos = valor.replace(/\D/g, '').length

  if (!patronTelefono.test(valor) || digitos < 7 || digitos > 15 || valor.length > LIMITES.telefono) {
    return 'Ingresa un telefono valido de 7 a 15 digitos.'
  }

  return ''
}

export function validarCorreo(correo) {
  const valor = correo.trim()

  if (!valor) {
    return 'El correo es obligatorio.'
  }

  if (valor.length > LIMITES.correo) {
    return `El correo no puede exceder ${LIMITES.correo} caracteres.`
  }

  if (!patronCorreo.test(valor)) {
    return 'Ingresa un correo valido.'
  }

  return ''
}

export function validarDireccion(direccion) {
  const valor = direccion.trim()

  if (!valor) {
    return 'La direccion es obligatoria.'
  }

  if (valor.length > LIMITES.direccion) {
    return `La direccion no puede exceder ${LIMITES.direccion} caracteres.`
  }

  if (!patronDireccion.test(valor)) {
    return 'La direccion contiene caracteres no permitidos.'
  }

  return ''
}

export function validarTextoFarmacia(valor, campo, maximo = LIMITES.medicamentoNombre) {
  const texto = valor.trim()

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
    return `Usa solo letras, numeros, espacios y signos basicos en ${campo.toLowerCase()}.`
  }

  return ''
}

export function validarCodigoLote(codigo) {
  const valor = codigo.trim()

  if (!valor) {
    return 'El numero de lote es obligatorio.'
  }

  if (valor.length < 2) {
    return 'El numero de lote debe tener al menos 2 caracteres.'
  }

  if (valor.length > LIMITES.lote) {
    return `El numero de lote no puede exceder ${LIMITES.lote} caracteres.`
  }

  if (!patronCodigoLote.test(valor)) {
    return 'Usa solo letras, numeros, punto, guion o guion bajo.'
  }

  return ''
}

export function validarStock(stock) {
  const numero = Number(stock)

  if (stock === '' || stock === null || Number.isNaN(numero)) {
    return 'El stock es obligatorio.'
  }

  if (!Number.isInteger(numero)) {
    return 'El stock debe ser un numero entero.'
  }

  if (numero < 0) {
    return 'El stock no puede ser negativo.'
  }

  if (numero > LIMITES.stock) {
    return `El stock no puede exceder ${LIMITES.stock}.`
  }

  return ''
}

export function validarPrecio(precio, campo = 'El precio') {
  const numero = Number(precio)

  if (precio === '' || precio === null || Number.isNaN(numero)) {
    return `${campo} es obligatorio.`
  }

  if (numero < 0) {
    return `${campo} no puede ser negativo.`
  }

  if (numero > LIMITES.precio) {
    return `${campo} es demasiado alto.`
  }

  if (!/^\d+(\.\d{1,2})?$/.test(String(precio))) {
    return `${campo} solo admite hasta 2 decimales.`
  }

  return ''
}
