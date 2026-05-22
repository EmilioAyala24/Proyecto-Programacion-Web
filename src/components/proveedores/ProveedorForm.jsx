import { useState } from 'react'
import {
  LIMITES,
  sanitizarDireccion,
  sanitizarProveedor,
  sanitizarTelefono,
  validarCorreo,
  validarDireccion,
  validarProveedor,
  validarTelefono,
} from '../../utils/validaciones'

const valoresIniciales = {
  nombre: '',
  telefono: '',
  correo: '',
  direccion: '',
}

function ProveedorForm({ proveedorInicial, onCrearProveedor, onGuardar }) {
  const [formulario, setFormulario] = useState({
    ...valoresIniciales,
    ...proveedorInicial,
  })
  const [errores, setErrores] = useState({})

  const manejarCambio = (event) => {
    const { name, value } = event.target
    const filtros = {
      nombre: sanitizarProveedor,
      telefono: sanitizarTelefono,
      correo: (texto) => texto.trim().slice(0, LIMITES.correo),
      direccion: sanitizarDireccion,
    }

    setFormulario((actual) => ({
      ...actual,
      [name]: filtros[name] ? filtros[name](value) : value,
    }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {
      nombre: validarProveedor(formulario.nombre),
      telefono: validarTelefono(formulario.telefono),
      correo: validarCorreo(formulario.correo),
      direccion: validarDireccion(formulario.direccion),
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
      telefono: formulario.telefono.trim(),
      correo: formulario.correo.trim(),
      direccion: formulario.direccion.trim(),
    }

    ;(onGuardar ?? onCrearProveedor)(datos)
    setFormulario(valoresIniciales)
    setErrores({})
  }

  return (
    <form className="proveedor-formulario" onSubmit={manejarEnvio} noValidate>
      <div className="campo-formulario">
        <label htmlFor="nombre">Nombre del proveedor</label>
        <input
          id="nombre"
          name="nombre"
          placeholder="Distribuidora Salud Total"
          value={formulario.nombre}
          onChange={manejarCambio}
          maxLength={LIMITES.proveedor}
        />
        {errores.nombre && <span className="mensaje-error">{errores.nombre}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="telefono">Telefono</label>
        <input
          id="telefono"
          name="telefono"
          inputMode="tel"
          placeholder="3121457890"
          value={formulario.telefono}
          onChange={manejarCambio}
          maxLength={LIMITES.telefono}
        />
        {errores.telefono && <span className="mensaje-error">{errores.telefono}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="correo">Correo</label>
        <input
          id="correo"
          name="correo"
          type="email"
          placeholder="contacto@proveedor.mx"
          value={formulario.correo}
          onChange={manejarCambio}
          maxLength={LIMITES.correo}
        />
        {errores.correo && <span className="mensaje-error">{errores.correo}</span>}
      </div>

      <div className="campo-formulario proveedor-formulario__direccion">
        <label htmlFor="direccion">Direccion</label>
        <input
          id="direccion"
          name="direccion"
          placeholder="Calle, numero, ciudad y estado"
          value={formulario.direccion}
          onChange={manejarCambio}
          maxLength={LIMITES.direccion}
        />
        {errores.direccion && <span className="mensaje-error">{errores.direccion}</span>}
      </div>

      <button className="boton boton--primario" type="submit">
        {proveedorInicial ? 'Guardar cambios' : 'Registrar proveedor'}
      </button>
    </form>
  )
}

export default ProveedorForm
