import { useEffect, useState } from 'react'
import {
  obtenerClientes,
  obtenerMedicamentosDisponibles,
  obtenerMetodosPago,
} from '../../services/ventasService'
import { useAuth } from '../../hooks/useAuth'
import { sanitizarEntero } from '../../utils/validaciones'

const valoresIniciales = {
  id_cliente: '',
  id_metPag: '',
  detalles: [],
}

function VentaForm({ onCrearVenta, cargando }) {
  const { usuario } = useAuth()
  const [formulario, setFormulario] = useState(valoresIniciales)
  const [errores, setErrores] = useState({})
  const [metodosPago, setMetodosPago] = useState([])
  const [clientes, setClientes] = useState([])
  const [medicamentosDisponibles, setMedicamentosDisponibles] = useState([])
  const [cargandoOpciones, setCargandoOpciones] = useState(true)
  const [detalleActual, setDetalleActual] = useState({
    id_medicamento: '',
    cantidad: '',
    precio_unitario: '',
  })
  const [errorDetalle, setErrorDetalle] = useState('')
  const formatoPrecio = (valor) => Number(valor || 0).toFixed(2)

  useEffect(() => {
    cargarOpciones()
  }, [])

  const cargarOpciones = async () => {
    try {
      const [metodos, clientesList, medicamentos] = await Promise.all([
        obtenerMetodosPago(),
        obtenerClientes(),
        obtenerMedicamentosDisponibles(),
      ])

      setMetodosPago(metodos)
      setClientes(clientesList)
      setMedicamentosDisponibles(medicamentos)
    } catch (error) {
      console.error('Error cargando opciones:', error)
    } finally {
      setCargandoOpciones(false)
    }
  }

  const manejarCambioDetalleActual = (event) => {
    const { name, value } = event.target

    if (name === 'id_medicamento') {
      const medicamento = medicamentosDisponibles.find(
        (item) => item.id_med.toString() === value.toString(),
      )

      setDetalleActual((actual) => ({
        ...actual,
        id_medicamento: value,
        precio_unitario: medicamento ? String(medicamento.precio_venta) : '',
      }))
      setErrorDetalle('')
      return
    }

    setDetalleActual((actual) => ({
      ...actual,
      [name]: name === 'cantidad' ? sanitizarEntero(value) : value,
    }))
    setErrorDetalle('')
  }

  const agregarDetalle = () => {
    // Validar
    if (!detalleActual.id_medicamento) {
      setErrorDetalle('Debe seleccionar un medicamento')
      return
    }

    const cantidad = Number(detalleActual.cantidad)
    const precioUnitario = Number(detalleActual.precio_unitario)

    if (!cantidad || Number.isNaN(cantidad) || cantidad <= 0 || !Number.isInteger(cantidad)) {
      setErrorDetalle('La cantidad debe ser un número positivo')
      return
    }

    if (!precioUnitario || Number.isNaN(precioUnitario) || precioUnitario <= 0) {
      setErrorDetalle('El precio unitario debe ser un número positivo')
      return
    }

    // Obtener el medicamento seleccionado
    const medicamento = medicamentosDisponibles.find(
      (m) => m.id_med.toString() === detalleActual.id_medicamento.toString(),
    )

    if (!medicamento) {
      setErrorDetalle('Medicamento no válido')
      return
    }

    // Validar stock
    if (cantidad > medicamento.stock_actual) {
      setErrorDetalle(
        `Stock insuficiente. Disponible: ${medicamento.stock_actual}`,
      )
      return
    }

    // Calcular subtotal
    const subtotal = cantidad * precioUnitario

    const nuevoDetalle = {
      id_medicamento: Number(detalleActual.id_medicamento),
      cantidad,
      precio_unitario: precioUnitario,
      subtotal,
      medicamento_nombre: medicamento.nombre,
      presentacion: medicamento.presentacion,
      concentracion: medicamento.concentracion,
    }

    setFormulario((actual) => ({
      ...actual,
      detalles: [...actual.detalles, nuevoDetalle],
    }))

    setDetalleActual({
      id_medicamento: '',
      cantidad: '',
      precio_unitario: '',
    })

    setErrorDetalle('')
  }

  const eliminarDetalle = (index) => {
    setFormulario((actual) => ({
      ...actual,
      detalles: actual.detalles.filter((_, i) => i !== index),
    }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!formulario.id_metPag) {
      nuevosErrores.id_metPag = 'El método de pago es requerido'
    }

    if (formulario.detalles.length === 0) {
      nuevosErrores.detalles = 'Debe agregar al menos un medicamento'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const manejarEnvio = (event) => {
    event.preventDefault()

    if (!validarFormulario()) {
      return
    }

    const datosVenta = {
      id_usuario: usuario?.id,
      id_metPag: Number(formulario.id_metPag),
      id_cliente: formulario.id_cliente ? Number(formulario.id_cliente) : null,
      detalles: formulario.detalles,
    }

    onCrearVenta(datosVenta)
    setFormulario(valoresIniciales)
    setErrores({})
  }

  const totalVenta = formulario.detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0)

  if (cargandoOpciones) {
    return <p className="estado-mensaje">Cargando opciones...</p>
  }

  return (
    <form className="venta-formulario" onSubmit={manejarEnvio} noValidate>
      {/* Sección de datos generales */}
      <div className="venta-formulario__seccion">
        <h3 className="venta-formulario__titulo">Datos de la venta</h3>

        <div className="venta-formulario__grupo">
          <div className="campo-formulario">
            <label htmlFor="venta-cliente">Cliente (Opcional)</label>
            <select
              id="venta-cliente"
              name="id_cliente"
              value={formulario.id_cliente}
              onChange={(e) => setFormulario({ ...formulario, id_cliente: e.target.value })}
            >
              <option value="">-- Público general --</option>
              {clientes.map((cliente) => (
                <option key={cliente.id_cliente} value={cliente.id_cliente}>
                  {cliente.nombre} {cliente.ap_pat || ''} {cliente.ap_mat || ''}
                </option>
              ))}
            </select>
          </div>

          <div className="campo-formulario">
            <label htmlFor="venta-metodo-pago">Método de pago *</label>
            <select
              id="venta-metodo-pago"
              name="id_metPag"
              value={formulario.id_metPag}
              onChange={(e) => setFormulario({ ...formulario, id_metPag: e.target.value })}
            >
              <option value="">-- Seleccionar --</option>
              {metodosPago.map((metodo) => (
                <option key={metodo.id_metPag} value={metodo.id_metPag}>
                  {metodo.nombre_metodo}
                </option>
              ))}
            </select>
            {errores.id_metPag && <span className="mensaje-error">{errores.id_metPag}</span>}
          </div>
        </div>
      </div>

      {/* Sección de agregación de medicamentos */}
      <div className="venta-formulario__seccion">
        <h3 className="venta-formulario__titulo">Agregar medicamentos</h3>

        <div className="venta-formulario__grupo">
          <div className="campo-formulario">
            <label htmlFor="venta-medicamento">Medicamento</label>
            <select
              id="venta-medicamento"
              name="id_medicamento"
              value={detalleActual.id_medicamento}
              onChange={manejarCambioDetalleActual}
            >
              <option value="">-- Seleccionar medicamento --</option>
              {medicamentosDisponibles.map((medicamento) => (
                <option key={medicamento.id_med} value={medicamento.id_med}>
                  {medicamento.nombre} ({medicamento.presentacion}) - Stock: {medicamento.stock_actual} - ${formatoPrecio(medicamento.precio_venta)}
                </option>
              ))}
            </select>
          </div>

          <div className="campo-formulario">
            <label htmlFor="venta-cantidad">Cantidad</label>
            <input
              id="venta-cantidad"
              name="cantidad"
              inputMode="numeric"
              min="1"
              value={detalleActual.cantidad}
              onChange={manejarCambioDetalleActual}
              placeholder="0"
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="venta-precio">Precio unitario</label>
            <input
              id="venta-precio"
              name="precio_unitario"
              type="number"
              min="0"
              step="0.01"
              value={detalleActual.precio_unitario}
              onChange={manejarCambioDetalleActual}
              placeholder="0.00"
              readOnly
            />
          </div>

          <button
            type="button"
            className="boton boton--primario"
            onClick={agregarDetalle}
            disabled={!detalleActual.id_medicamento}
          >
            Agregar
          </button>
        </div>

        {errorDetalle && <span className="mensaje-error">{errorDetalle}</span>}
      </div>

      {/* Tabla de medicamentos agregados */}
      {formulario.detalles.length > 0 && (
        <div className="venta-formulario__seccion">
          <h3 className="venta-formulario__titulo">Medicamentos en la venta</h3>

          <div className="tabla-contenedor">
            <table className="tabla tabla--compacta">
              <thead className="tabla__cabecera">
                <tr className="tabla__fila">
                  <th className="tabla__celda tabla__celda--encabezado">Medicamento</th>
                  <th className="tabla__celda tabla__celda--encabezado">Cantidad</th>
                  <th className="tabla__celda tabla__celda--encabezado">Precio Unit.</th>
                  <th className="tabla__celda tabla__celda--encabezado">Subtotal</th>
                  <th className="tabla__celda tabla__celda--encabezado">Acción</th>
                </tr>
              </thead>
              <tbody className="tabla__cuerpo">
                {formulario.detalles.map((detalle, index) => (
                  <tr key={index} className="tabla__fila">
                    <td className="tabla__celda">
                      <div className="medicamento-info">
                        <span className="medicamento-info__nombre">{detalle.medicamento_nombre}</span>
                        <span className="medicamento-info__detalle">
                          {detalle.presentacion} {detalle.concentracion}
                        </span>
                      </div>
                    </td>
                    <td className="tabla__celda">{detalle.cantidad}</td>
                    <td className="tabla__celda">${formatoPrecio(detalle.precio_unitario)}</td>
                    <td className="tabla__celda tabla__celda--enfasis">
                      ${formatoPrecio(detalle.subtotal)}
                    </td>
                    <td className="tabla__celda">
                      <button
                        type="button"
                        className="boton boton--peligro boton--pequeno"
                        onClick={() => eliminarDetalle(index)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {errores.detalles && <span className="mensaje-error">{errores.detalles}</span>}
        </div>
      )}

      {/* Resumen de totales */}
      <div className="venta-formulario__resumen">
        <div className="resumen-item">
          <span>Total de venta:</span>
          <span className="resumen-item__valor">${formatoPrecio(totalVenta)}</span>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="venta-formulario__acciones">
        <button
          type="submit"
          className="boton boton--primario"
          disabled={cargando || formulario.detalles.length === 0}
        >
          {cargando ? 'Procesando...' : 'Registrar venta'}
        </button>
      </div>
    </form>
  )
}

export default VentaForm
