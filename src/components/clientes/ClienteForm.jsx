import { useState } from 'react'
import {
  LIMITES,
  sanitizarNombrePersona,
  sanitizarTelefono,
  validarNombrePersona,
  validarTelefono,
} from '../../utils/validaciones'

const valoresIniciales = {
  nombre: '',
  apPat: '',
  apMat: '',
  telefono: '',
}

function ClienteForm({ clienteInicial, onCrearCliente, onGuardar }) {
  const [formulario, setFormulario] = useState({
    ...valoresIniciales,
    ...clienteInicial,
  })
  const [errores, setErrores] = useState({})

  const manejarCambio = (event) => {
    const { name, value } = event.target
    const filtros = {
      nombre: (texto) => sanitizarNombrePersona(texto, LIMITES.nombrePersona),
      apPat: (texto) => sanitizarNombrePersona(texto, LIMITES.apellido),
      apMat: (texto) => sanitizarNombrePersona(texto, LIMITES.apellido),
      telefono: sanitizarTelefono,
    }

    setFormulario((actual) => ({
      ...actual,
      [name]: filtros[name] ? filtros[name](value) : value,
    }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {
      nombre: validarNombrePersona(formulario.nombre, 'El nombre', LIMITES.nombrePersona),
      telefono: validarTelefono(formulario.telefono, false),
    }

    if (formulario.apPat) {
      nuevosErrores.apPat = validarNombrePersona(
        formulario.apPat,
        'El apellido paterno',
        LIMITES.apellido,
      )
    }

    if (formulario.apMat) {
      nuevosErrores.apMat = validarNombrePersona(
        formulario.apMat,
        'El apellido materno',
        LIMITES.apellido,
      )
    }

    setErrores(nuevosErrores)
    return !Object.values(nuevosErrores).some(Boolean)
  }

  const manejarEnvio = (event) => {
    event.preventDefault()

    if (!validarFormulario()) {
      return
    }

    const datos = {
      nombre: formulario.nombre.trim(),
      apPat: formulario.apPat.trim() || '',
      apMat: formulario.apMat.trim() || '',
      telefono: formulario.telefono.trim() || '',
    }

    ;(onGuardar ?? onCrearCliente)(datos)
    setFormulario(valoresIniciales)
    setErrores({})
  }

  return (
    <form className="cliente-formulario" onSubmit={manejarEnvio} noValidate>
      <div className="campo-formulario">
        <label htmlFor="cliente-nombre">Nombre *</label>
        <input
          id="cliente-nombre"
          name="nombre"
          placeholder="Juan"
          value={formulario.nombre}
          onChange={manejarCambio}
          maxLength={LIMITES.nombrePersona}
          required
        />
        {errores.nombre && <span className="mensaje-error">{errores.nombre}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="cliente-ap-pat">Apellido Paterno</label>
        <input
          id="cliente-ap-pat"
          name="apPat"
          placeholder="Perez"
          value={formulario.apPat}
          onChange={manejarCambio}
          maxLength={LIMITES.apellido}
        />
        {errores.apPat && <span className="mensaje-error">{errores.apPat}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="cliente-ap-mat">Apellido Materno</label>
        <input
          id="cliente-ap-mat"
          name="apMat"
          placeholder="Garcia"
          value={formulario.apMat}
          onChange={manejarCambio}
          maxLength={LIMITES.apellido}
        />
        {errores.apMat && <span className="mensaje-error">{errores.apMat}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="cliente-telefono">Telefono</label>
        <input
          id="cliente-telefono"
          name="telefono"
          type="tel"
          placeholder="+52 312 123 4567"
          value={formulario.telefono}
          onChange={manejarCambio}
          maxLength={LIMITES.telefono}
        />
        {errores.telefono && <span className="mensaje-error">{errores.telefono}</span>}
      </div>

      <button type="submit" className="boton boton--primario">
        {clienteInicial ? 'Guardar cambios' : 'Registrar Cliente'}
      </button>
    </form>
  )
}

export default ClienteForm
