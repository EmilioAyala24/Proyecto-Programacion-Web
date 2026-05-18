import { useState } from 'react'
import { validarTextoFarmacia } from '../../utils/validaciones'

const valoresIniciales = {
  nombre: '',
  apPat: '',
  apMat: '',
  telefono: '',
}

function ClienteForm({ onCrearCliente }) {
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
      nombre: validarTextoFarmacia(formulario.nombre, 'El nombre'),
    }

    // Validar apellidos y teléfono (opcionales)
    if (formulario.apPat && formulario.apPat.trim().length > 60) {
      nuevosErrores.apPat = 'El apellido paterno no puede exceder 60 caracteres'
    }
    if (formulario.apMat && formulario.apMat.trim().length > 60) {
      nuevosErrores.apMat = 'El apellido materno no puede exceder 60 caracteres'
    }

    setErrores(nuevosErrores)
    return !Object.values(nuevosErrores).some(Boolean)
  }

  const manejarEnvio = (event) => {
    event.preventDefault()

    if (!validarFormulario()) {
      return
    }

    onCrearCliente({
      nombre: formulario.nombre.trim(),
      apPat: formulario.apPat.trim() || '',
      apMat: formulario.apMat.trim() || '',
      telefono: formulario.telefono.trim() || '',
    })
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
          required
        />
        {errores.nombre && <span className="mensaje-error">{errores.nombre}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="cliente-ap-pat">Apellido Paterno</label>
        <input
          id="cliente-ap-pat"
          name="apPat"
          placeholder="Pérez"
          value={formulario.apPat}
          onChange={manejarCambio}
        />
        {errores.apPat && <span className="mensaje-error">{errores.apPat}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="cliente-ap-mat">Apellido Materno</label>
        <input
          id="cliente-ap-mat"
          name="apMat"
          placeholder="García"
          value={formulario.apMat}
          onChange={manejarCambio}
        />
        {errores.apMat && <span className="mensaje-error">{errores.apMat}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="cliente-telefono">Teléfono</label>
        <input
          id="cliente-telefono"
          name="telefono"
          type="tel"
          placeholder="+57 123 456 7890"
          value={formulario.telefono}
          onChange={manejarCambio}
        />
      </div>

      <button type="submit" className="boton boton--primario">
        Registrar Cliente
      </button>
    </form>
  )
}

export default ClienteForm
