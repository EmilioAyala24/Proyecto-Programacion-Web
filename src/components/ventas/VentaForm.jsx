import { useEffect, useMemo, useState } from 'react'
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

function formatearFecha(fecha) {
  if (!fecha) {
    return 'Sin caducidad'
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${String(fecha).split('T')[0]}T00:00:00`))
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
    id_lote: '',
    cantidad: '',
    precio_unitario: '',
  })
  const [errorDetalle, setErrorDetalle] = useState('')
  const formatoPrecio = (valor) => Number(valor || 0).toFixed(2)

  useEffect(() => {
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

    cargarOpciones()
  }, [])

  const medicamentosCatalogo = useMemo(() => {
    const mapa = new Map()

    medicamentosDisponibles.forEach((medicamento) => {
      if (!mapa.has(medicamento.id_med)) {
        mapa.set(medicamento.id_med, medicamento)
      }
    })

    return Array.from(mapa.values())
  }, [medicamentosDisponibles])

  const lotesDelMedicamento = useMemo(
    () => medicamentosDisponibles
      .filter((item) => String(item.id_med) === String(detalleActual.id_medicamento))
      .sort((a, b) => {
        const fechaA = a.fecha_caducidad ? new Date(a.fecha_caducidad).getTime() : Infinity
        const fechaB = b.fecha_caducidad ? new Date(b.fecha_caducidad).getTime() : Infinity
        return fechaA - fechaB
      }),
    [detalleActual.id_medicamento, medicamentosDisponibles],
  )

  const manejarCambioDetalleActual = (event) => {
    const { name, value } = event.target

    if (name === 'id_medicamento') {
      setDetalleActual({
        id_medicamento: value,
        id_lote: '',
        cantidad: '',
        precio_unitario: '',
      })
      setErrorDetalle('')
      return
    }

    if (name === 'id_lote') {
      const lote = medicamentosDisponibles.find(
        (item) => String(item.id_lote) === String(value),
      )

      setDetalleActual((actual) => ({
        ...actual,
        id_lote: value,
        precio_unitario: lote ? String(lote.precio_venta) : '',
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
    if (!detalleActual.id_medicamento) {
      setErrorDetalle('Debe seleccionar un medicamento.')
      return
    }

    if (!detalleActual.id_lote) {
      setErrorDetalle('Debe seleccionar el lote a vender.')
      return
    }

    const cantidad = Number(detalleActual.cantidad)
    const lote = medicamentosDisponibles.find(
      (item) => String(item.id_lote) === String(detalleActual.id_lote),
    )

    if (!lote) {
      setErrorDetalle('Lote no valido.')
      return
    }

    if (!cantidad || Number.isNaN(cantidad) || cantidad <= 0 || !Number.isInteger(cantidad)) {
      setErrorDetalle('La cantidad debe ser un numero positivo.')
      return
    }

    if (cantidad > lote.stock_actual) {
      setErrorDetalle(`Stock insuficiente. Disponible en este lote: ${lote.stock_actual}`)
      return
    }

    const precioUnitario = Number(lote.precio_venta)
    const subtotal = cantidad * precioUnitario

    const detalleExistente = formulario.detalles.findIndex(
      (detalle) => detalle.id_lote === Number(lote.id_lote),
    )

    if (detalleExistente >= 0) {
      const cantidadActual = Number(formulario.detalles[detalleExistente].cantidad)

      if (cantidadActual + cantidad > lote.stock_actual) {
        setErrorDetalle(`Stock insuficiente. Ya agregaste ${cantidadActual} de ${lote.stock_actual}.`)
        return
      }

      setFormulario((actual) => ({
        ...actual,
        detalles: actual.detalles.map((detalle, index) => {
          if (index !== detalleExistente) {
            return detalle
          }

          const nuevaCantidad = detalle.cantidad + cantidad

          return {
            ...detalle,
            cantidad: nuevaCantidad,
            subtotal: nuevaCantidad * detalle.precio_unitario,
          }
        }),
      }))
    } else {
      setFormulario((actual) => ({
        ...actual,
        detalles: [
          ...actual.detalles,
          {
            id_medicamento: Number(lote.id_med),
            id_lote: Number(lote.id_lote),
            cantidad,
            precio_unitario: precioUnitario,
            subtotal,
            medicamento_nombre: lote.nombre,
            presentacion: lote.presentacion,
            concentracion: lote.concentracion,
            numero_lote: lote.numero_lote,
            stock_disponible: lote.stock_actual,
            fecha_caducidad: lote.fecha_caducidad,
          },
        ],
      }))
    }

    setDetalleActual({
      id_medicamento: '',
      id_lote: '',
      cantidad: '',
      precio_unitario: '',
    })
    setErrorDetalle('')
  }

  const cambiarCantidadDetalle = (index, valor) => {
    const cantidadTexto = sanitizarEntero(valor)
    const cantidad = Number(cantidadTexto)

    setFormulario((actual) => ({
      ...actual,
      detalles: actual.detalles.map((detalle, detalleIndex) => {
        if (detalleIndex !== index) {
          return detalle
        }

        const cantidadValidada = cantidadTexto === '' ? '' : Math.min(cantidad, detalle.stock_disponible)

        return {
          ...detalle,
          cantidad: cantidadValidada,
          subtotal: Number(cantidadValidada || 0) * detalle.precio_unitario,
        }
      }),
    }))
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
      nuevosErrores.id_metPag = 'El metodo de pago es requerido.'
    }

    if (formulario.detalles.length === 0) {
      nuevosErrores.detalles = 'Debe agregar al menos un medicamento.'
    }

    if (formulario.detalles.some((detalle) => !detalle.cantidad || Number(detalle.cantidad) <= 0)) {
      nuevosErrores.detalles = 'Revisa las cantidades de los medicamentos agregados.'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const manejarEnvio = (event) => {
    event.preventDefault()

    if (!validarFormulario()) {
      return
    }

    onCrearVenta({
      id_usuario: usuario?.id,
      id_metPag: Number(formulario.id_metPag),
      id_cliente: formulario.id_cliente ? Number(formulario.id_cliente) : null,
      detalles: formulario.detalles.map((detalle) => ({
        id_medicamento: detalle.id_medicamento,
        id_lote: detalle.id_lote,
        cantidad: Number(detalle.cantidad),
        precio_unitario: detalle.precio_unitario,
      })),
    })
    setFormulario(valoresIniciales)
    setErrores({})
  }

  const totalVenta = formulario.detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0)

  if (cargandoOpciones) {
    return <p className="estado-mensaje">Cargando opciones...</p>
  }

  return (
    <form className="venta-formulario" onSubmit={manejarEnvio} noValidate>
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
              <option value="">-- Publico general --</option>
              {clientes.map((cliente) => (
                <option key={cliente.id_cliente} value={cliente.id_cliente}>
                  {cliente.nombre} {cliente.ap_pat || ''} {cliente.ap_mat || ''}
                </option>
              ))}
            </select>
          </div>

          <div className="campo-formulario">
            <label htmlFor="venta-metodo-pago">Metodo de pago *</label>
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

      <div className="venta-formulario__seccion">
        <h3 className="venta-formulario__titulo">Agregar medicamentos</h3>

        <div className="venta-formulario__grupo venta-formulario__grupo--venta">
          <div className="campo-formulario">
            <label htmlFor="venta-medicamento">Medicamento</label>
            <select
              id="venta-medicamento"
              name="id_medicamento"
              value={detalleActual.id_medicamento}
              onChange={manejarCambioDetalleActual}
            >
              <option value="">-- Seleccionar medicamento --</option>
              {medicamentosCatalogo.map((medicamento) => (
                <option key={medicamento.id_med} value={medicamento.id_med}>
                  {medicamento.nombre} ({medicamento.presentacion} {medicamento.concentracion})
                </option>
              ))}
            </select>
          </div>

          <div className="campo-formulario">
            <label htmlFor="venta-lote">Lote</label>
            <select
              id="venta-lote"
              name="id_lote"
              value={detalleActual.id_lote}
              onChange={manejarCambioDetalleActual}
              disabled={!detalleActual.id_medicamento}
            >
              <option value="">-- Seleccionar lote --</option>
              {lotesDelMedicamento.map((lote) => (
                <option key={lote.id_lote} value={lote.id_lote}>
                  Lote {lote.numero_lote} - Stock {lote.stock_actual} - ${formatoPrecio(lote.precio_venta)} - Cad. {formatearFecha(lote.fecha_caducidad)}
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
              value={detalleActual.precio_unitario}
              placeholder="0.00"
              readOnly
            />
          </div>

          <button
            type="button"
            className="boton boton--primario"
            onClick={agregarDetalle}
            disabled={!detalleActual.id_lote}
          >
            Agregar
          </button>
        </div>

        {errorDetalle && <span className="mensaje-error">{errorDetalle}</span>}
      </div>

      {formulario.detalles.length > 0 && (
        <div className="venta-formulario__seccion">
          <h3 className="venta-formulario__titulo">Medicamentos en la venta</h3>

          <div className="tabla-contenedor">
            <table className="tabla-datos tabla--compacta">
              <thead>
                <tr>
                  <th>Medicamento</th>
                  <th>Lote</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {formulario.detalles.map((detalle, index) => (
                  <tr key={detalle.id_lote}>
                    <td>
                      <div className="medicamento-info">
                        <span className="medicamento-info__nombre">{detalle.medicamento_nombre}</span>
                        <span className="medicamento-info__detalle">
                          {detalle.presentacion} {detalle.concentracion}
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong>{detalle.numero_lote}</strong>
                      <span className="medicamento-info__detalle">
                        Cad. {formatearFecha(detalle.fecha_caducidad)}
                      </span>
                    </td>
                    <td>
                      <input
                        className="cantidad-tabla"
                        inputMode="numeric"
                        value={detalle.cantidad}
                        onChange={(e) => cambiarCantidadDetalle(index, e.target.value)}
                      />
                    </td>
                    <td>${formatoPrecio(detalle.precio_unitario)}</td>
                    <td className="tabla-datos__monto">${formatoPrecio(detalle.subtotal)}</td>
                    <td>
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

      <div className="venta-formulario__resumen">
        <div className="resumen-item">
          <span>Total de venta:</span>
          <span className="resumen-item__valor">${formatoPrecio(totalVenta)}</span>
        </div>
      </div>

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
