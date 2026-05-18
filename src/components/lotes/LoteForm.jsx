import { useState } from 'react'
import { validarStock, validarTextoFarmacia } from '../../utils/validaciones'

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

function LoteForm({ loteInicial, medicamentos = [], proveedores = [], onGuardar }) {
  const [formulario, setFormulario] = useState({
    ...valoresIniciales,
    ...loteInicial,
    idMedicamento: loteInicial?.idMedicamento ? String(loteInicial.idMedicamento) : '',
    idProveedor: loteInicial?.idProveedor ? String(loteInicial.idProveedor) : '',
    stockDisponible: loteInicial?.stockDisponible ?? '',
    precioCompra: loteInicial?.precioCompra ?? '',
    precioVenta: loteInicial?.precioVenta ?? '',
  })
  const [errores, setErrores] = useState({})

  const manejarCambio = (event) => {
    const { name, value } = event.target
    setFormulario((actual) => ({ ...actual, [name]: value }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {
      codigo: validarTextoFarmacia(formulario.codigo, 'El numero de lote'),
      stockDisponible: validarStock(formulario.stockDisponible),
    }

    if (!formulario.idProveedor) {
      nuevosErrores.idProveedor = 'Selecciona un proveedor.'
    }

    if (!formulario.idMedicamento) {
      nuevosErrores.idMedicamento = 'Selecciona un medicamento.'
    }

    if (!formulario.fechaCaducidad) {
      nuevosErrores.fechaCaducidad = 'La fecha de caducidad es obligatoria.'
    }

    if (Number(formulario.precioCompra || 0) < 0) {
      nuevosErrores.precioCompra = 'El precio de compra no puede ser negativo.'
    }

    if (Number(formulario.precioVenta || 0) < 0) {
      nuevosErrores.precioVenta = 'El precio de venta no puede ser negativo.'
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
    const medicamento = medicamentos.find((item) => String(item.id) === String(formulario.idMedicamento))

    onGuardar({
      codigo: formulario.codigo.trim(),
      idMedicamento: Number(formulario.idMedicamento),
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
        <label htmlFor="lote-codigo">Numero de lote</label>
        <input
          id="lote-codigo"
          name="codigo"
          placeholder="L-2026-001"
          value={formulario.codigo}
          onChange={manejarCambio}
        />
        {errores.codigo && <span className="mensaje-error">{errores.codigo}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="lote-medicamento">Medicamento</label>
        <select
          id="lote-medicamento"
          name="idMedicamento"
          value={formulario.idMedicamento}
          onChange={manejarCambio}
        >
          <option value="">Seleccionar medicamento</option>
          {medicamentos.map((medicamento) => (
            <option key={medicamento.id} value={medicamento.id}>
              {medicamento.nombre} {medicamento.concentracion}
            </option>
          ))}
        </select>
        {errores.idMedicamento && <span className="mensaje-error">{errores.idMedicamento}</span>}
      </div>

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
          min="0"
          name="stockDisponible"
          placeholder="50"
          type="number"
          value={formulario.stockDisponible}
          onChange={manejarCambio}
        />
        {errores.stockDisponible && <span className="mensaje-error">{errores.stockDisponible}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="lote-fabricacion">Fabricacion</label>
        <input
          id="lote-fabricacion"
          name="fechaFabricacion"
          type="date"
          value={formulario.fechaFabricacion}
          onChange={manejarCambio}
        />
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
          min="0"
          name="precioCompra"
          step="0.01"
          type="number"
          value={formulario.precioCompra}
          onChange={manejarCambio}
        />
        {errores.precioCompra && <span className="mensaje-error">{errores.precioCompra}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="lote-precio-venta">Precio venta</label>
        <input
          id="lote-precio-venta"
          min="0"
          name="precioVenta"
          step="0.01"
          type="number"
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
