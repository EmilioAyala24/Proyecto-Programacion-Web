import { useState } from 'react'
import { validarTextoFarmacia } from '../../utils/validaciones'

const valoresIniciales = {
  usuario: '',
  rol: 'cajero',
  nombre: '',
  apPat: '',
  apMat: '',
  telefono: '',
}

function UsuarioForm({ usuarioInicial, onCrearUsuario, onGuardar }) {
  const [formulario, setFormulario] = useState({
    ...valoresIniciales,
    ...usuarioInicial,
  })
  const [errores, setErrores] = useState({})

  const manejarCambio = (event) => {
    const { name, value } = event.target
    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {}

    // Validar usuario
    if (!formulario.usuario.trim()) {
      nuevosErrores.usuario = 'El usuario es requerido'
    } else if (formulario.usuario.trim().length < 3) {
      nuevosErrores.usuario = 'El usuario debe tener al menos 3 caracteres'
    }

    // Validar rol
    if (!formulario.rol) {
      nuevosErrores.rol = 'El rol es requerido'
    }

    // Validar nombre
    nuevosErrores.nombre = validarTextoFarmacia(formulario.nombre, 'El nombre')

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
        <label htmlFor="usuario-nombre">Nombre *</label>
        <input
          id="usuario-nombre"
          name="nombre"
          placeholder="Juan"
          value={formulario.nombre}
          onChange={manejarCambio}
          required
        />
        {errores.nombre && <span className="mensaje-error">{errores.nombre}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="usuario-ap-pat">Apellido Paterno</label>
        <input
          id="usuario-ap-pat"
          name="apPat"
          placeholder="Pérez"
          value={formulario.apPat}
          onChange={manejarCambio}
        />
      </div>

      <div className="campo-formulario">
        <label htmlFor="usuario-ap-mat">Apellido Materno</label>
        <input
          id="usuario-ap-mat"
          name="apMat"
          placeholder="García"
          value={formulario.apMat}
          onChange={manejarCambio}
        />
      </div>

      <div className="campo-formulario">
        <label htmlFor="usuario-telefono">Teléfono</label>
        <input
          id="usuario-telefono"
          name="telefono"
          type="tel"
          placeholder="+57 123 456 7890"
          value={formulario.telefono}
          onChange={manejarCambio}
        />
      </div>

      <button type="submit" className="boton boton--primario">
        {usuarioInicial ? 'Guardar cambios' : 'Crear Usuario'}
      </button>
    </form>
  )
}

export default UsuarioForm
