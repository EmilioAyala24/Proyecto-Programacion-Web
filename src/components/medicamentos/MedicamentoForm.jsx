import { useState } from 'react'
import {
  LIMITES,
  sanitizarDecimal,
  sanitizarEntero,
  sanitizarTextoFarmacia,
  validarPrecio,
  validarStock,
  validarTextoFarmacia,
} from '../../utils/validaciones'

const valoresIniciales = {
  nombre: '',
  presentacion: '',
  concentracion: '',
  contenido: '',
  requiereReceta: false,
  stockDisponible: '',
  precioUnitario: '',
}

function MedicamentoForm({ medicamentoInicial, onCrearMedicamento, onGuardar }) {
  const [formulario, setFormulario] = useState({
    ...valoresIniciales,
    ...medicamentoInicial,
    stockDisponible: medicamentoInicial?.stockDisponible ?? '',
    precioUnitario: medicamentoInicial?.precioUnitario ?? '',
  })
  const [errores, setErrores] = useState({})

  const manejarCambio = (event) => {
    const { checked, name, type, value } = event.target
    const filtros = {
      nombre: (texto) => sanitizarTextoFarmacia(texto, LIMITES.medicamentoNombre),
      presentacion: (texto) => sanitizarTextoFarmacia(texto, LIMITES.presentacion),
      concentracion: (texto) => sanitizarTextoFarmacia(texto, LIMITES.concentracion),
      contenido: (texto) => sanitizarTextoFarmacia(texto, LIMITES.contenido),
      stockDisponible: sanitizarEntero,
      precioUnitario: sanitizarDecimal,
    }

    setFormulario((actual) => ({
      ...actual,
      [name]: type === 'checkbox' ? checked : filtros[name]?.(value) ?? value,
    }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {
      nombre: validarTextoFarmacia(formulario.nombre, 'El nombre', LIMITES.medicamentoNombre),
      presentacion: validarTextoFarmacia(
        formulario.presentacion,
        'La presentacion',
        LIMITES.presentacion,
      ),
      concentracion: validarTextoFarmacia(
        formulario.concentracion,
        'La concentracion',
        LIMITES.concentracion,
      ),
      contenido: validarTextoFarmacia(formulario.contenido, 'El contenido', LIMITES.contenido),
      stockDisponible: validarStock(formulario.stockDisponible),
      precioUnitario: validarPrecio(formulario.precioUnitario, 'El precio unitario'),
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
      presentacion: formulario.presentacion.trim(),
      concentracion: formulario.concentracion.trim(),
      contenido: formulario.contenido.trim(),
      requiereReceta: formulario.requiereReceta,
      stockDisponible: Number(formulario.stockDisponible),
      precioUnitario: Number(formulario.precioUnitario),
    }

    ;(onGuardar ?? onCrearMedicamento)(datos)
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
          maxLength={LIMITES.medicamentoNombre}
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
          maxLength={LIMITES.presentacion}
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
          maxLength={LIMITES.concentracion}
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
          maxLength={LIMITES.contenido}
        />
        {errores.contenido && <span className="mensaje-error">{errores.contenido}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="medicamento-stock">Stock disponible</label>
        <input
          id="medicamento-stock"
          name="stockDisponible"
          inputMode="numeric"
          min="0"
          placeholder="25"
          value={formulario.stockDisponible}
          onChange={manejarCambio}
        />
        {errores.stockDisponible && <span className="mensaje-error">{errores.stockDisponible}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="medicamento-precio">Precio unitario</label>
        <input
          id="medicamento-precio"
          name="precioUnitario"
          inputMode="decimal"
          min="0"
          placeholder="35.50"
          value={formulario.precioUnitario}
          onChange={manejarCambio}
        />
        {errores.precioUnitario && <span className="mensaje-error">{errores.precioUnitario}</span>}
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
        {medicamentoInicial ? 'Guardar cambios' : 'Registrar medicamento'}
      </button>
    </form>
  )
}

export default MedicamentoForm
