import { useState } from 'react'
import ContadorCaracteres from '../common/ContadorCaracteres'
import {
  LIMITES,
  normalizarTelefonoCaptura,
  PREFIJO_TELEFONO,
  sanitizarNombrePersona,
  sanitizarTelefono,
  validarCorreo,
  validarNombrePersona,
  validarTelefono,
} from '../../utils/validaciones'

const valoresIniciales = {
  nombre: '',
  apPat: '',
  apMat: '',
  telefono: PREFIJO_TELEFONO,
  correo: '',
}

function ClienteForm({ clienteInicial, onCrearCliente, onGuardar }) {
  const [formulario, setFormulario] = useState({
    ...valoresIniciales,
    ...clienteInicial,
    telefono: sanitizarTelefono(clienteInicial?.telefono ?? valoresIniciales.telefono),
  })
  const [errores, setErrores] = useState({})

  const manejarCambio = (event) => {
    const { name, value } = event.target
    const filtros = {
      nombre: (texto) => sanitizarNombrePersona(texto, LIMITES.nombrePersona),
      apPat: (texto) => sanitizarNombrePersona(texto, LIMITES.apellido),
      apMat: (texto) => sanitizarNombrePersona(texto, LIMITES.apellido),
      telefono: sanitizarTelefono,
      correo: (texto) => texto.trim().slice(0, LIMITES.correo),
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
      correo: formulario.correo ? validarCorreo(formulario.correo) : '',
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
      telefono: normalizarTelefonoCaptura(formulario.telefono),
      correo: formulario.correo.trim() || '',
    }

    ;(onGuardar ?? onCrearCliente)(datos)
    setFormulario(valoresIniciales)
    setErrores({})
  }

  return (
    <form className="cliente-formulario" onSubmit={manejarEnvio} noValidate>
      <div className="campo-formulario">
        <label htmlFor="cliente-nombre">Nombre *</label>
        <div className="campo-con-contador">
          <input
            id="cliente-nombre"
            name="nombre"
            placeholder="Juan"
            value={formulario.nombre}
            onChange={manejarCambio}
            maxLength={LIMITES.nombrePersona}
            required
          />
          <ContadorCaracteres valor={formulario.nombre} maximo={LIMITES.nombrePersona} />
        </div>
        {errores.nombre && <span className="mensaje-error">{errores.nombre}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="cliente-ap-pat">Apellido Paterno</label>
        <div className="campo-con-contador">
          <input
            id="cliente-ap-pat"
            name="apPat"
            placeholder="Perez"
            value={formulario.apPat}
            onChange={manejarCambio}
            maxLength={LIMITES.apellido}
          />
          <ContadorCaracteres valor={formulario.apPat} maximo={LIMITES.apellido} />
        </div>
        {errores.apPat && <span className="mensaje-error">{errores.apPat}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="cliente-ap-mat">Apellido Materno</label>
        <div className="campo-con-contador">
          <input
            id="cliente-ap-mat"
            name="apMat"
            placeholder="Garcia"
            value={formulario.apMat}
            onChange={manejarCambio}
            maxLength={LIMITES.apellido}
          />
          <ContadorCaracteres valor={formulario.apMat} maximo={LIMITES.apellido} />
        </div>
        {errores.apMat && <span className="mensaje-error">{errores.apMat}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="cliente-telefono">Teléfono</label>
        <div className="campo-con-contador">
          <input
            id="cliente-telefono"
            name="telefono"
            type="tel"
            placeholder="(312)1234567"
            value={formulario.telefono}
            onChange={manejarCambio}
            maxLength={LIMITES.telefono}
          />
          <ContadorCaracteres valor={formulario.telefono} maximo={LIMITES.telefono} />
        </div>
        {errores.telefono && <span className="mensaje-error">{errores.telefono}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="cliente-correo">Correo electronico</label>
        <div className="campo-con-contador">
          <input
            id="cliente-correo"
            name="correo"
            type="email"
            placeholder="cliente@correo.com"
            value={formulario.correo}
            onChange={manejarCambio}
            maxLength={LIMITES.correo}
          />
          <ContadorCaracteres valor={formulario.correo} maximo={LIMITES.correo} />
        </div>
        {errores.correo && <span className="mensaje-error">{errores.correo}</span>}
      </div>

      <button type="submit" className="boton boton--primario">
        {clienteInicial ? 'Guardar cambios' : 'Registrar Cliente'}
      </button>
    </form>
  )
}

export default ClienteForm
