import { useState } from 'react'
import {
  LIMITES,
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
  telefono: '',
  password: '',
}

function UsuarioForm({ usuarioInicial, onCrearUsuario, onGuardar }) {
  const [formulario, setFormulario] = useState({
    ...valoresIniciales,
    ...usuarioInicial,
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
        nuevosErrores.password = 'La contrasena es requerida'
      } else if (formulario.password.length < 8) {
        nuevosErrores.password = 'La contrasena debe tener al menos 8 caracteres'
      } else if (
        !/[A-Z]/.test(formulario.password) ||
        !/[a-z]/.test(formulario.password) ||
        !/\d/.test(formulario.password)
      ) {
        nuevosErrores.password = 'Incluye mayuscula, minuscula y numero'
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
      telefono: formulario.telefono.trim() || '',
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
        <input
          id="usuario-username"
          name="usuario"
          placeholder="juan.perez"
          value={formulario.usuario}
          onChange={manejarCambio}
          maxLength={LIMITES.usuario}
          required
        />
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
          {usuarioInicial ? 'Nueva contrasena' : 'Contrasena *'}
        </label>
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
        {errores.password && <span className="mensaje-error">{errores.password}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="usuario-nombre">Nombre *</label>
        <input
          id="usuario-nombre"
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
        <label htmlFor="usuario-ap-pat">Apellido Paterno</label>
        <input
          id="usuario-ap-pat"
          name="apPat"
          placeholder="Perez"
          value={formulario.apPat}
          onChange={manejarCambio}
          maxLength={LIMITES.apellido}
        />
        {errores.apPat && <span className="mensaje-error">{errores.apPat}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="usuario-ap-mat">Apellido Materno</label>
        <input
          id="usuario-ap-mat"
          name="apMat"
          placeholder="Garcia"
          value={formulario.apMat}
          onChange={manejarCambio}
          maxLength={LIMITES.apellido}
        />
        {errores.apMat && <span className="mensaje-error">{errores.apMat}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="usuario-telefono">Telefono</label>
        <input
          id="usuario-telefono"
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
        {usuarioInicial ? 'Guardar cambios' : 'Crear Usuario'}
      </button>
    </form>
  )
}

export default UsuarioForm
