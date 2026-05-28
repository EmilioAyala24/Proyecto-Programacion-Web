import { useState } from 'react'
import ContadorCaracteres from '../common/ContadorCaracteres'
import {
  LIMITES,
  normalizarTelefonoCaptura,
  PREFIJO_TELEFONO,
  sanitizarNombrePersona,
  sanitizarTelefono,
  sanitizarUsuario,
  validarNombrePersona,
  validarTelefono,
  validarUsuario,
} from '../../utils/validaciones'

const valoresIniciales = {
  usuario: '',
  rol: 'cajero',
  nombre: '',
  apPat: '',
  apMat: '',
  telefono: PREFIJO_TELEFONO,
  password: '',
}

function UsuarioForm({ usuarioInicial, onCrearUsuario, onGuardar }) {
  const [formulario, setFormulario] = useState({
    ...valoresIniciales,
    ...usuarioInicial,
    telefono: sanitizarTelefono(usuarioInicial?.telefono ?? valoresIniciales.telefono),
  })
  const [errores, setErrores] = useState({})

  const manejarCambio = (event) => {
    const { name, value } = event.target
    const filtros = {
      usuario: sanitizarUsuario,
      nombre: (texto) => sanitizarNombrePersona(texto, LIMITES.nombrePersona),
      apPat: (texto) => sanitizarNombrePersona(texto, LIMITES.apellido),
      apMat: (texto) => sanitizarNombrePersona(texto, LIMITES.apellido),
      telefono: sanitizarTelefono,
      password: (texto) => texto.slice(0, 100),
    }

    setFormulario((actual) => ({
      ...actual,
      [name]: filtros[name] ? filtros[name](value) : value,
    }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {
      usuario: validarUsuario(formulario.usuario),
      nombre: validarNombrePersona(formulario.nombre, 'El nombre', LIMITES.nombrePersona),
      telefono: validarTelefono(formulario.telefono, false),
    }

    if (!usuarioInicial || formulario.password) {
      if (!formulario.password) {
        nuevosErrores.password = 'La contraseña es requerida'
      } else if (formulario.password.length < 8) {
        nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres'
      } else if (
        !/[A-Z]/.test(formulario.password) ||
        !/[a-z]/.test(formulario.password) ||
        !/\d/.test(formulario.password)
      ) {
        nuevosErrores.password = 'Incluye mayúscula, minúscula y número'
      }
    }

    if (!['admin', 'cajero'].includes(formulario.rol)) {
      nuevosErrores.rol = 'El rol debe ser admin o cajero.'
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

    Object.keys(nuevosErrores).forEach((llave) => {
      if (!nuevosErrores[llave]) {
        delete nuevosErrores[llave]
      }
    })

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const manejarEnvio = (event) => {
    event.preventDefault()

    if (!validarFormulario()) {
      return
    }

    const datos = {
      usuario: formulario.usuario.trim(),
      rol: formulario.rol,
      nombre: formulario.nombre.trim(),
      apPat: formulario.apPat.trim() || '',
      apMat: formulario.apMat.trim() || '',
      telefono: normalizarTelefonoCaptura(formulario.telefono),
      password: formulario.password,
    }

    ;(onGuardar ?? onCrearUsuario)(datos)
    setFormulario(valoresIniciales)
    setErrores({})
  }

  return (
    <form className="usuario-formulario" onSubmit={manejarEnvio} noValidate>
      <div className="campo-formulario">
        <label htmlFor="usuario-username">Nombre de usuario *</label>
        <div className="campo-con-contador">
          <input
            id="usuario-username"
            name="usuario"
            placeholder="juan.perez"
            value={formulario.usuario}
            onChange={manejarCambio}
            maxLength={LIMITES.usuario}
            required
          />
          <ContadorCaracteres valor={formulario.usuario} maximo={LIMITES.usuario} />
        </div>
        {errores.usuario && <span className="mensaje-error">{errores.usuario}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="usuario-rol">Rol *</label>
        <select id="usuario-rol" name="rol" value={formulario.rol} onChange={manejarCambio}>
          <option value="cajero">Cajero/Vendedor</option>
          <option value="admin">Administrador</option>
        </select>
        {errores.rol && <span className="mensaje-error">{errores.rol}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="usuario-password">
          {usuarioInicial ? 'Nueva contraseña' : 'Contraseña *'}
        </label>
        <div className="campo-con-contador">
          <input
            id="usuario-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={formulario.password}
            onChange={manejarCambio}
            maxLength={100}
            required={!usuarioInicial}
          />
          <ContadorCaracteres valor={formulario.password} maximo={100} />
        </div>
        {errores.password && <span className="mensaje-error">{errores.password}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="usuario-nombre">Nombre *</label>
        <div className="campo-con-contador">
          <input
            id="usuario-nombre"
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
        <label htmlFor="usuario-ap-pat">Apellido Paterno</label>
        <div className="campo-con-contador">
          <input
            id="usuario-ap-pat"
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
        <label htmlFor="usuario-ap-mat">Apellido Materno</label>
        <div className="campo-con-contador">
          <input
            id="usuario-ap-mat"
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
        <label htmlFor="usuario-telefono">Teléfono</label>
        <div className="campo-con-contador">
          <input
            id="usuario-telefono"
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

      <button type="submit" className="boton boton--primario">
        {usuarioInicial ? 'Guardar cambios' : 'Crear Usuario'}
      </button>
    </form>
  )
}

export default UsuarioForm
