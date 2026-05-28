import { useState } from 'react'
import ContadorCaracteres from '../common/ContadorCaracteres'
import {
  LIMITES,
  normalizarTelefonoCaptura,
  PREFIJO_TELEFONO,
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
  telefono: PREFIJO_TELEFONO,
  correo: '',
  direccion: '',
}

function ProveedorForm({ proveedorInicial, onCrearProveedor, onGuardar }) {
  const [formulario, setFormulario] = useState({
    ...valoresIniciales,
    ...proveedorInicial,
    telefono: sanitizarTelefono(proveedorInicial?.telefono ?? valoresIniciales.telefono),
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
      telefono: normalizarTelefonoCaptura(formulario.telefono),
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
        <div className="campo-con-contador">
          <input
            id="nombre"
            name="nombre"
            placeholder="Distribuidora Salud Total"
            value={formulario.nombre}
            onChange={manejarCambio}
            maxLength={LIMITES.proveedor}
          />
          <ContadorCaracteres valor={formulario.nombre} maximo={LIMITES.proveedor} />
        </div>
        {errores.nombre && <span className="mensaje-error">{errores.nombre}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="telefono">Teléfono</label>
        <div className="campo-con-contador">
          <input
            id="telefono"
            name="telefono"
            inputMode="tel"
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
        <label htmlFor="correo">Correo</label>
        <div className="campo-con-contador">
          <input
            id="correo"
            name="correo"
            type="email"
            placeholder="contacto@proveedor.mx"
            value={formulario.correo}
            onChange={manejarCambio}
            maxLength={LIMITES.correo}
          />
          <ContadorCaracteres valor={formulario.correo} maximo={LIMITES.correo} />
        </div>
        {errores.correo && <span className="mensaje-error">{errores.correo}</span>}
      </div>

      <div className="campo-formulario proveedor-formulario__direccion">
        <label htmlFor="direccion">Dirección</label>
        <div className="campo-con-contador">
          <input
            id="direccion"
            name="direccion"
            placeholder="Calle, número, ciudad y estado"
            value={formulario.direccion}
            onChange={manejarCambio}
            maxLength={LIMITES.direccion}
          />
          <ContadorCaracteres valor={formulario.direccion} maximo={LIMITES.direccion} />
        </div>
        {errores.direccion && <span className="mensaje-error">{errores.direccion}</span>}
      </div>

      <button className="boton boton--primario" type="submit">
        {proveedorInicial ? 'Guardar cambios' : 'Registrar proveedor'}
      </button>
    </form>
  )
}

export default ProveedorForm
