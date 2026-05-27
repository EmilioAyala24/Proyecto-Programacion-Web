import { useState } from 'react'
import {
  LIMITES,
  sanitizarCodigoLote,
  sanitizarDecimal,
  sanitizarEntero,
  validarCodigoLote,
  validarFechaISO,
  validarPrecio,
  validarStock,
} from '../../utils/validaciones'

const valoresIniciales = {
  codigo: '',
  idMedicamento: '',
  idProveedor: '',
  stockDisponible: '',
  fechaFabricacion: '',
  fechaIngreso: '',
  fechaCaducidad: '',
  precioCompra: '',
  precioVenta: '',
}

function LoteForm({ loteInicial, medicamentoFijo, medicamentos = [], proveedores = [], onGuardar }) {
  const [formulario, setFormulario] = useState({
    ...valoresIniciales,
    ...loteInicial,
    idMedicamento: medicamentoFijo?.id
      ? String(medicamentoFijo.id)
      : loteInicial?.idMedicamento
        ? String(loteInicial.idMedicamento)
        : '',
    idProveedor: loteInicial?.idProveedor ? String(loteInicial.idProveedor) : '',
    stockDisponible: loteInicial?.stockDisponible ?? '',
    precioCompra: loteInicial?.precioCompra ?? '',
    precioVenta: loteInicial?.precioVenta ?? '',
  })
  const [errores, setErrores] = useState({})

  const manejarCambio = (event) => {
    const { name, value } = event.target
    const filtros = {
      codigo: sanitizarCodigoLote,
      stockDisponible: sanitizarEntero,
      precioCompra: sanitizarDecimal,
      precioVenta: sanitizarDecimal,
    }

    setFormulario((actual) => ({
      ...actual,
      [name]: filtros[name] ? filtros[name](value) : value,
    }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {
      codigo: validarCodigoLote(formulario.codigo),
      stockDisponible: validarStock(formulario.stockDisponible),
      precioCompra: validarPrecio(formulario.precioCompra || '0', 'El precio de compra'),
      precioVenta: validarPrecio(formulario.precioVenta || '0', 'El precio de venta'),
      fechaFabricacion: validarFechaISO(formulario.fechaFabricacion, 'La fecha de fabricacion'),
      fechaIngreso: validarFechaISO(formulario.fechaIngreso, 'La fecha de ingreso'),
    }

    if (!formulario.idProveedor) {
      nuevosErrores.idProveedor = 'Selecciona un proveedor.'
    }

    if (!formulario.fechaCaducidad) {
      nuevosErrores.fechaCaducidad = 'La fecha de caducidad es obligatoria.'
    } else {
      nuevosErrores.fechaCaducidad = validarFechaISO(
        formulario.fechaCaducidad,
        'La fecha de caducidad',
      )
    }

    if (!nuevosErrores.fechaIngreso && formulario.fechaFabricacion && formulario.fechaIngreso) {
      const fabricacion = new Date(`${formulario.fechaFabricacion}T00:00:00`)
      const ingreso = new Date(`${formulario.fechaIngreso}T00:00:00`)

      if (ingreso < fabricacion) {
        nuevosErrores.fechaIngreso = 'La fecha de ingreso no puede ser anterior a la fabricacion.'
      }
    }

    if (!nuevosErrores.fechaCaducidad && formulario.fechaCaducidad) {
      const caducidad = new Date(`${formulario.fechaCaducidad}T00:00:00`)

      if (formulario.fechaFabricacion) {
        const fabricacion = new Date(`${formulario.fechaFabricacion}T00:00:00`)

        if (caducidad <= fabricacion) {
          nuevosErrores.fechaCaducidad = 'La caducidad debe ser posterior a la fabricacion.'
        }
      }

      if (!nuevosErrores.fechaCaducidad && formulario.fechaIngreso) {
        const ingreso = new Date(`${formulario.fechaIngreso}T00:00:00`)

        if (caducidad < ingreso) {
          nuevosErrores.fechaCaducidad = 'La caducidad no puede ser anterior al ingreso.'
        }
      }
    }

    setErrores(nuevosErrores)
    return !Object.values(nuevosErrores).some(Boolean)
  }

  const manejarEnvio = (event) => {
    event.preventDefault()

    if (!validarFormulario()) {
      return
    }

    const proveedor = proveedores.find((item) => String(item.id) === String(formulario.idProveedor))
    const medicamento = medicamentoFijo || medicamentos.find((item) => String(item.id) === String(formulario.idMedicamento))

    onGuardar({
      codigo: formulario.codigo.trim(),
      idMedicamento: medicamentoFijo?.id ? Number(medicamentoFijo.id) : formulario.idMedicamento ? Number(formulario.idMedicamento) : null,
      medicamento: medicamento?.nombre ?? '',
      idProveedor: Number(formulario.idProveedor),
      proveedor: proveedor?.nombre ?? '',
      stockDisponible: Number(formulario.stockDisponible),
      fechaFabricacion: formulario.fechaFabricacion,
      fechaIngreso: formulario.fechaIngreso,
      fechaCaducidad: formulario.fechaCaducidad,
      precioCompra: Number(formulario.precioCompra || 0),
      precioVenta: Number(formulario.precioVenta || 0),
    })
  }

  return (
    <form className="lote-formulario" onSubmit={manejarEnvio} noValidate>
      <div className="campo-formulario">
        <label htmlFor="lote-codigo">Número de lote</label>
        <input
          id="lote-codigo"
          name="codigo"
          placeholder="L-2026-001"
          value={formulario.codigo}
          onChange={manejarCambio}
          maxLength={LIMITES.lote}
        />
        {errores.codigo && <span className="mensaje-error">{errores.codigo}</span>}
      </div>

      {medicamentoFijo ? (
        <div className="campo-formulario">
          <label htmlFor="lote-medicamento-fijo">Medicamento</label>
          <input
            id="lote-medicamento-fijo"
            value={`${medicamentoFijo.nombre} ${medicamentoFijo.concentracion || ''}`.trim()}
            readOnly
          />
        </div>
      ) : (
        <div className="campo-formulario">
          <label htmlFor="lote-medicamento">Medicamento</label>
          <select
            id="lote-medicamento"
            name="idMedicamento"
            value={formulario.idMedicamento}
            onChange={manejarCambio}
          >
            <option value="">Sin medicamento</option>
            {medicamentos.map((medicamento) => (
              <option key={medicamento.id} value={medicamento.id}>
                {medicamento.nombre} {medicamento.concentracion}
              </option>
            ))}
          </select>
          {errores.idMedicamento && <span className="mensaje-error">{errores.idMedicamento}</span>}
        </div>
      )}

      <div className="campo-formulario">
        <label htmlFor="lote-proveedor">Proveedor</label>
        <select
          id="lote-proveedor"
          name="idProveedor"
          value={formulario.idProveedor}
          onChange={manejarCambio}
        >
          <option value="">Seleccionar proveedor</option>
          {proveedores.map((proveedor) => (
            <option key={proveedor.id} value={proveedor.id}>
              {proveedor.nombre}
            </option>
          ))}
        </select>
        {errores.idProveedor && <span className="mensaje-error">{errores.idProveedor}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="lote-stock">Stock</label>
        <input
          id="lote-stock"
          inputMode="numeric"
          min="0"
          name="stockDisponible"
          placeholder="50"
          value={formulario.stockDisponible}
          onChange={manejarCambio}
        />
        {errores.stockDisponible && <span className="mensaje-error">{errores.stockDisponible}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="lote-fabricacion">Fabricación</label>
        <input
          id="lote-fabricacion"
          name="fechaFabricacion"
          type="date"
          value={formulario.fechaFabricacion}
          onChange={manejarCambio}
        />
        {errores.fechaFabricacion && (
          <span className="mensaje-error">{errores.fechaFabricacion}</span>
        )}
      </div>

      <div className="campo-formulario">
        <label htmlFor="lote-ingreso">Ingreso</label>
        <input
          id="lote-ingreso"
          name="fechaIngreso"
          type="date"
          value={formulario.fechaIngreso}
          onChange={manejarCambio}
        />
        {errores.fechaIngreso && <span className="mensaje-error">{errores.fechaIngreso}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="lote-caducidad">Caducidad</label>
        <input
          id="lote-caducidad"
          name="fechaCaducidad"
          type="date"
          value={formulario.fechaCaducidad}
          onChange={manejarCambio}
        />
        {errores.fechaCaducidad && <span className="mensaje-error">{errores.fechaCaducidad}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="lote-precio-compra">Precio compra</label>
        <input
          id="lote-precio-compra"
          inputMode="decimal"
          min="0"
          name="precioCompra"
          value={formulario.precioCompra}
          onChange={manejarCambio}
        />
        {errores.precioCompra && <span className="mensaje-error">{errores.precioCompra}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="lote-precio-venta">Precio venta</label>
        <input
          id="lote-precio-venta"
          inputMode="decimal"
          min="0"
          name="precioVenta"
          value={formulario.precioVenta}
          onChange={manejarCambio}
        />
        {errores.precioVenta && <span className="mensaje-error">{errores.precioVenta}</span>}
      </div>

      <button className="boton boton--primario" type="submit">
        {loteInicial ? 'Guardar cambios' : 'Registrar lote'}
      </button>
    </form>
  )
}

export default LoteForm
