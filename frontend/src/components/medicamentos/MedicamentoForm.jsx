import { useState } from 'react'
import ContadorCaracteres from '../common/ContadorCaracteres'
import {
  LIMITES,
  sanitizarDecimal,
  sanitizarEntero,
  sanitizarTextoFarmacia,
  validarTextoFarmacia,
} from '../../utils/validaciones'

const valoresIniciales = {
  nombre: '',
  presentacion: '',
  concentracionValor: '',
  concentracionUnidad: 'mg',
  contenidoValor: '',
  contenidoUnidad: 'tabletas',
  requiereReceta: false,
}

const presentaciones = [
  'Tabletas',
  'Capsulas',
  'Comprimidos',
  'Jarabe',
  'Suspension',
  'Solucion',
  'Gotas',
  'Crema',
  'Pomada',
  'Gel',
  'Inyectable',
  'Ampolletas',
  'Sobres',
  'Aerosol',
]
const unidadesConcentracion = ['mg', 'g', 'mcg', 'mL', 'mg/mL', '%', 'UI']
const unidadesContenido = ['tabletas', 'capsulas', 'comprimidos', 'mL', 'g', 'sobres', 'ampolletas', 'piezas']

function separarValorUnidad(texto, unidadPredeterminada) {
  const partes = String(texto ?? '').trim().split(/\s+/)

  if (partes.length < 2) {
    return {
      valor: partes[0] ?? '',
      unidad: unidadPredeterminada,
    }
  }

  return {
    valor: partes.slice(0, -1).join(' '),
    unidad: partes.at(-1),
  }
}

function MedicamentoForm({ medicamentoInicial, onCrearMedicamento, onGuardar }) {
  const concentracionInicial = separarValorUnidad(medicamentoInicial?.concentracion, 'mg')
  const contenidoInicial = separarValorUnidad(medicamentoInicial?.contenido, 'tabletas')
  const opcionesPresentacion = presentaciones.includes(medicamentoInicial?.presentacion)
    ? presentaciones
    : [medicamentoInicial?.presentacion, ...presentaciones].filter(Boolean)
  const [formulario, setFormulario] = useState({
    ...valoresIniciales,
    ...medicamentoInicial,
    concentracionValor: concentracionInicial.valor,
    concentracionUnidad: concentracionInicial.unidad,
    contenidoValor: contenidoInicial.valor,
    contenidoUnidad: contenidoInicial.unidad,
  })
  const [errores, setErrores] = useState({})

  const manejarCambio = (event) => {
    const { checked, name, type, value } = event.target
    const filtros = {
      nombre: (texto) => sanitizarTextoFarmacia(texto, LIMITES.medicamentoNombre),
      presentacion: (texto) => sanitizarTextoFarmacia(texto, LIMITES.presentacion),
      concentracionValor: sanitizarDecimal,
      contenidoValor: sanitizarEntero,
    }

    setFormulario((actual) => ({
      ...actual,
      [name]: type === 'checkbox' ? checked : filtros[name]?.(value) ?? value,
    }))
  }

  const validarFormulario = () => {
    const concentracion = `${formulario.concentracionValor} ${formulario.concentracionUnidad}`.trim()
    const contenido = `${formulario.contenidoValor} ${formulario.contenidoUnidad}`.trim()
    const nuevosErrores = {
      nombre: validarTextoFarmacia(formulario.nombre, 'El nombre', LIMITES.medicamentoNombre),
      presentacion: validarTextoFarmacia(
        formulario.presentacion,
        'La presentación',
        LIMITES.presentacion,
      ),
      concentracion: validarTextoFarmacia(
        concentracion,
        'La concentración',
        LIMITES.concentracion,
      ),
      contenido: validarTextoFarmacia(contenido, 'El contenido', LIMITES.contenido),
    }

    setErrores(nuevosErrores)
    return !Object.values(nuevosErrores).some(Boolean)
  }

  const manejarEnvio = (event) => {
    event.preventDefault()

    if (!validarFormulario()) {
      return
    }

    const concentracion = `${formulario.concentracionValor} ${formulario.concentracionUnidad}`.trim()
    const contenido = `${formulario.contenidoValor} ${formulario.contenidoUnidad}`.trim()

    const datos = {
      nombre: formulario.nombre.trim(),
      presentacion: formulario.presentacion.trim(),
      concentracion,
      contenido,
      requiereReceta: formulario.requiereReceta,
    }

    ;(onGuardar ?? onCrearMedicamento)(datos)
    setFormulario(valoresIniciales)
    setErrores({})
  }

  return (
    <form className="medicamento-formulario" onSubmit={manejarEnvio} noValidate>
      <div className="campo-formulario">
        <label htmlFor="medicamento-nombre">Nombre del medicamento</label>
        <div className="campo-con-contador">
          <input
            id="medicamento-nombre"
            name="nombre"
            placeholder="Paracetamol"
            value={formulario.nombre}
            onChange={manejarCambio}
            maxLength={LIMITES.medicamentoNombre}
          />
          <ContadorCaracteres valor={formulario.nombre} maximo={LIMITES.medicamentoNombre} />
        </div>
        {errores.nombre && <span className="mensaje-error">{errores.nombre}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="medicamento-presentacion">Presentación</label>
        <select
          id="medicamento-presentacion"
          name="presentacion"
          value={formulario.presentacion}
          onChange={manejarCambio}
        >
          <option value="">Selecciona una presentación</option>
          {opcionesPresentacion.map((presentacion) => (
            <option key={presentacion} value={presentacion}>
              {presentacion}
            </option>
          ))}
        </select>
        {errores.presentacion && <span className="mensaje-error">{errores.presentacion}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="medicamento-concentracion">Concentración</label>
        <div className="campo-compuesto">
          <input
            id="medicamento-concentracion"
            name="concentracionValor"
            inputMode="decimal"
            placeholder="500"
            value={formulario.concentracionValor}
            onChange={manejarCambio}
          />
          <select
            aria-label="Unidad de concentración"
            name="concentracionUnidad"
            value={formulario.concentracionUnidad}
            onChange={manejarCambio}
          >
            {unidadesConcentracion.map((unidad) => (
              <option key={unidad} value={unidad}>
                {unidad}
              </option>
            ))}
          </select>
        </div>
        {errores.concentracion && <span className="mensaje-error">{errores.concentracion}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="medicamento-contenido">Contenido</label>
        <div className="campo-compuesto">
          <input
            id="medicamento-contenido"
            name="contenidoValor"
            inputMode="numeric"
            placeholder="20"
            value={formulario.contenidoValor}
            onChange={manejarCambio}
          />
          <select
            aria-label="Unidad de contenido"
            name="contenidoUnidad"
            value={formulario.contenidoUnidad}
            onChange={manejarCambio}
          >
            {unidadesContenido.map((unidad) => (
              <option key={unidad} value={unidad}>
                {unidad}
              </option>
            ))}
          </select>
        </div>
        {errores.contenido && <span className="mensaje-error">{errores.contenido}</span>}
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
