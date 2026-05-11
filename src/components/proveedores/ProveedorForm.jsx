import { useState } from 'react'
import { validarCorreo, validarProveedor, validarTelefono } from '../../utils/validaciones'

const valoresIniciales = {
  nombre: '',
  telefono: '',
  correo: '',
  direccion: '',
}

function ProveedorForm({ onCrearProveedor }) {
  const [formulario, setFormulario] = useState(valoresIniciales)
  const [errores, setErrores] = useState({})

  const manejarCambio = (event) => {
    const { name, value } = event.target
    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {
      nombre: validarProveedor(formulario.nombre),
      telefono: validarTelefono(formulario.telefono),
      correo: validarCorreo(formulario.correo),
      direccion: formulario.direccion.trim() ? '' : 'La direccion es obligatoria.',
    }

    setErrores(nuevosErrores)
    return !Object.values(nuevosErrores).some(Boolean)
  }

  const manejarEnvio = (event) => {
    event.preventDefault()

    if (!validarFormulario()) {
      return
    }

    onCrearProveedor({
      nombre: formulario.nombre.trim(),
      telefono: formulario.telefono.trim(),
      correo: formulario.correo.trim(),
      direccion: formulario.direccion.trim(),
    })
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
        />
        {errores.direccion && <span className="mensaje-error">{errores.direccion}</span>}
      </div>

      <button className="boton boton--primario" type="submit">
        Registrar proveedor
      </button>
    </form>
  )
}

export default ProveedorForm
