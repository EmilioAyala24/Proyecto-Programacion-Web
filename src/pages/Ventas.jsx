import { useEffect, useMemo, useState } from 'react'
import AddButton from '../components/common/AddButton'
import Modal from '../components/common/Modal'
import FiltrosVentas from '../components/filtros/FiltrosVentas'
import VentaForm from '../components/ventas/VentaForm'
import VentasTable from '../components/ventas/VentasTable'
import { crearVenta, obtenerVentas } from '../services/ventasService'

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

  useEffect(() => {
    obtenerVentas()
      .then(setVentas)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  const ventasFiltradas = useMemo(() => {
    return ventas.filter((venta) => {
      const coincideId =
        !filtros.id || (venta.id_ventas && venta.id_ventas.toString().includes(filtros.id))

      const coincideCliente =
        !filtros.cliente ||
        (venta.cliente_nombre &&
          venta.cliente_nombre.toLowerCase().includes(filtros.cliente.toLowerCase()))

      const coincideUsuario =
        !filtros.usuario ||
        (venta.usuario_nombre &&
          venta.usuario_nombre.toLowerCase().includes(filtros.usuario.toLowerCase()))

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
          <div className="indicador__contenido">
            <span className="indicador__etiqueta">Total de ventas</span>
            <strong className="indicador__valor">{ventas.length}</strong>
          </div>
        </article>

        <article className="indicador">
          <div className="indicador__contenido">
            <span className="indicador__etiqueta">Monto total</span>
            <strong className="indicador__valor">
              ${ventas.reduce((sum, venta) => sum + venta.total, 0).toFixed(2)}
            </strong>
          </div>
        </article>

        <article className="indicador">
          <div className="indicador__contenido">
            <span className="indicador__etiqueta">Medicamentos vendidos</span>
            <strong className="indicador__valor">
              {ventas.reduce((sum, venta) => sum + venta.cantidad_medicamentos, 0)}
            </strong>
          </div>
        </article>
      </div>

      {/* Sección de búsqueda */}
      <section className="seccion-modulo">
        <h2 className="seccion-modulo__titulo">Historial de ventas</h2>

        <div style={{ marginBottom: '16px' }}>
          <AddButton
            onClick={() => setModalAbierto(true)}
            title="Registrar nueva venta"
            style={{ alignSelf: 'flex-end' }}
          />
        </div>

        <FiltrosVentas filtros={filtros} onChange={setFiltros} />

        <VentasTable ventas={ventasFiltradas} cargando={cargando} error={error} />
      </section>

      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Registrar nueva venta"
      >
        <VentaForm onCrearVenta={manejarCrearVenta} cargando={cargandoCrear} />
      </Modal>
    </section>
  )
}

export default Ventas
