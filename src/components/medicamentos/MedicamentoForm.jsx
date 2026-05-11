import { useState } from 'react'
import { validarStock, validarTextoFarmacia } from '../../utils/validaciones'

const valoresIniciales = {
  nombre: '',
  presentacion: '',
  concentracion: '',
  contenido: '',
  requiereReceta: false,
  stockDisponible: '',
}

function MedicamentoForm({ onCrearMedicamento }) {
  const [formulario, setFormulario] = useState(valoresIniciales)
  const [errores, setErrores] = useState({})

  const manejarCambio = (event) => {
    const { checked, name, type, value } = event.target
    setFormulario((actual) => ({
      ...actual,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {
      nombre: validarTextoFarmacia(formulario.nombre, 'El nombre'),
      presentacion: validarTextoFarmacia(formulario.presentacion, 'La presentacion'),
      concentracion: validarTextoFarmacia(formulario.concentracion, 'La concentracion'),
      contenido: validarTextoFarmacia(formulario.contenido, 'El contenido'),
      stockDisponible: validarStock(formulario.stockDisponible),
    }

    setErrores(nuevosErrores)
    return !Object.values(nuevosErrores).some(Boolean)
  }

  const manejarEnvio = (event) => {
    event.preventDefault()

    if (!validarFormulario()) {
      return
    }

    onCrearMedicamento({
      nombre: formulario.nombre.trim(),
      presentacion: formulario.presentacion.trim(),
      concentracion: formulario.concentracion.trim(),
      contenido: formulario.contenido.trim(),
      requiereReceta: formulario.requiereReceta,
      stockDisponible: Number(formulario.stockDisponible),
    })
    setFormulario(valoresIniciales)
    setErrores({})
  }

  return (
    <form className="medicamento-formulario" onSubmit={manejarEnvio} noValidate>
      <div className="campo-formulario">
        <label htmlFor="medicamento-nombre">Nombre del medicamento</label>
        <input
          id="medicamento-nombre"
          name="nombre"
          placeholder="Paracetamol"
          value={formulario.nombre}
          onChange={manejarCambio}
        />
        {errores.nombre && <span className="mensaje-error">{errores.nombre}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="medicamento-presentacion">Presentacion</label>
        <input
          id="medicamento-presentacion"
          name="presentacion"
          placeholder="Tabletas"
          value={formulario.presentacion}
          onChange={manejarCambio}
        />
        {errores.presentacion && <span className="mensaje-error">{errores.presentacion}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="medicamento-concentracion">Concentracion</label>
        <input
          id="medicamento-concentracion"
          name="concentracion"
          placeholder="500 mg"
          value={formulario.concentracion}
          onChange={manejarCambio}
        />
        {errores.concentracion && <span className="mensaje-error">{errores.concentracion}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="medicamento-contenido">Contenido</label>
        <input
          id="medicamento-contenido"
          name="contenido"
          placeholder="20 tabletas"
          value={formulario.contenido}
          onChange={manejarCambio}
        />
        {errores.contenido && <span className="mensaje-error">{errores.contenido}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="medicamento-stock">Stock disponible</label>
        <input
          id="medicamento-stock"
          name="stockDisponible"
          min="0"
          placeholder="25"
          type="number"
          value={formulario.stockDisponible}
          onChange={manejarCambio}
        />
        {errores.stockDisponible && <span className="mensaje-error">{errores.stockDisponible}</span>}
      </div>

      <label className="campo-check" htmlFor="medicamento-receta">
        <input
          id="medicamento-receta"
          checked={formulario.requiereReceta}
          name="requiereReceta"
          type="checkbox"
          onChange={manejarCambio}
        />
        Requiere receta
      </label>

      <button className="boton boton--primario" type="submit">
        Registrar medicamento
      </button>
    </form>
  )
}

export default MedicamentoForm
