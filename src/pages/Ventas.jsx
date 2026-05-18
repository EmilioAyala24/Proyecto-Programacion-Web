import { useEffect, useMemo, useState } from 'react'
import AddButton from '../components/common/AddButton'
import DetalleRegistro from '../components/common/DetalleRegistro'
import Modal from '../components/common/Modal'
import FiltrosVentas from '../components/filtros/FiltrosVentas'
import VentaForm from '../components/ventas/VentaForm'
import VentasTable from '../components/ventas/VentasTable'
import { crearVenta, obtenerDetalleVenta, obtenerVentas } from '../services/ventasService'

function Ventas() {
  const [ventas, setVentas] = useState([])
  const [filtros, setFiltros] = useState({
    id: '',
    cliente: '',
    usuario: '',
  })
  const [cargando, setCargando] = useState(true)
  const [cargandoCrear, setCargandoCrear] = useState(false)
  const [error, setError] = useState('')
  const [exitoMensaje, setExitoMensaje] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [ventaViendo, setVentaViendo] = useState(null)
  const [detalleVenta, setDetalleVenta] = useState([])
  const formatoPrecio = (valor) => Number(valor || 0).toFixed(2)

  useEffect(() => {
    obtenerVentas()
      .then(setVentas)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  const ventasFiltradas = useMemo(() => {
    return ventas.filter((venta) => {
      const coincideId =
        !filtros.id || (venta.id && venta.id.toString().includes(filtros.id))

      const coincideCliente =
        !filtros.cliente ||
        (venta.cliente &&
          venta.cliente.toLowerCase().includes(filtros.cliente.toLowerCase()))

      const coincideUsuario =
        !filtros.usuario ||
        (venta.usuario &&
          venta.usuario.toLowerCase().includes(filtros.usuario.toLowerCase()))

      return coincideId && coincideCliente && coincideUsuario
    })
  }, [filtros, ventas])

  const manejarCrearVenta = async (nuevaVenta) => {
    setCargandoCrear(true)
    setError('')
    setExitoMensaje('')

    try {
      await crearVenta(nuevaVenta)
      setExitoMensaje('¡Venta registrada exitosamente!')
      setModalAbierto(false)

      // Recargar ventas
      const ventasActualizadas = await obtenerVentas()
      setVentas(ventasActualizadas)

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setExitoMensaje(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargandoCrear(false)
    }
  }

  const manejarVerVenta = async (venta) => {
    try {
      setVentaViendo(venta)
      setDetalleVenta(await obtenerDetalleVenta(venta.id))
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="ventas-pagina">
      <div className="encabezado-pagina">
        <span className="encabezado-pagina__etiqueta">Módulo de ventas</span>
        <h1>Ventas de medicamentos</h1>
        <p>Registra nuevas ventas y consulta el historial de transacciones.</p>
      </div>

      {exitoMensaje && (
        <div className="notificacion notificacion--exito">
          {exitoMensaje}
        </div>
      )}

      {error && (
        <div className="notificacion notificacion--error">
          {error}
        </div>
      )}

      <div className="modulo-resumen">
        <article className="indicador">
          <span>Total de ventas</span>
          <strong>{ventas.length}</strong>
          <small>Transacciones registradas</small>
        </article>

        <article className="indicador">
          <span>Monto total</span>
          <strong>${formatoPrecio(ventas.reduce((sum, venta) => sum + Number(venta.total || 0), 0))}</strong>
          <small>Ingresos acumulados</small>
        </article>

        <article className="indicador">
          <span>Medicamentos vendidos</span>
          <strong>{ventas.reduce((sum, venta) => sum + venta.cantidad_medicamentos, 0)}</strong>
          <small>Unidades vendidas</small>
        </article>
      </div>

      {/* Sección de búsqueda */}
      <section className="modulo-panel">
        <div className="modulo-panel__encabezado">
          <div>
            <h2>Historial de ventas</h2>
            <p>Consulta ventas por ID, cliente o usuario.</p>
          </div>
          <AddButton
            onClick={() => setModalAbierto(true)}
            title="Registrar nueva venta"
          />
        </div>

        <FiltrosVentas filtros={filtros} onChange={setFiltros} />

        <VentasTable
          ventas={ventasFiltradas}
          cargando={cargando}
          error={error}
          onVer={manejarVerVenta}
        />
      </section>

      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Registrar nueva venta"
      >
        <VentaForm onCrearVenta={manejarCrearVenta} cargando={cargandoCrear} />
      </Modal>

      <Modal
        isOpen={Boolean(ventaViendo)}
        onClose={() => {
          setVentaViendo(null)
          setDetalleVenta([])
        }}
        title="Detalle de venta"
      >
        {ventaViendo && (
          <>
            <DetalleRegistro
              campos={[
                { etiqueta: 'Venta', valor: `#${ventaViendo.id}` },
                { etiqueta: 'Fecha', valor: ventaViendo.fecha },
                { etiqueta: 'Usuario', valor: ventaViendo.usuario },
                { etiqueta: 'Cliente', valor: ventaViendo.cliente },
                { etiqueta: 'Metodo de pago', valor: ventaViendo.metodoPago },
                { etiqueta: 'Total', valor: `$${formatoPrecio(ventaViendo.total)}` },
              ]}
            />
            <div className="tabla-contenedor">
              <table className="tabla-datos tabla--compacta">
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleVenta.map((detalle) => (
                    <tr key={detalle.id}>
                      <td>{detalle.medicamento}</td>
                      <td>{detalle.cantidad}</td>
                      <td>${formatoPrecio(detalle.precio_unitario)}</td>
                      <td>${formatoPrecio(detalle.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal>
    </section>
  )
}

export default Ventas
