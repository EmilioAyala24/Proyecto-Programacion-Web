import { useEffect, useMemo, useState } from 'react'
import VentaForm from '../components/ventas/VentaForm'
import VentasTable from '../components/ventas/VentasTable'
import { crearVenta, obtenerVentas } from '../services/ventasService'

function Ventas() {
  const [ventas, setVentas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [cargandoCrear, setCargandoCrear] = useState(false)
  const [error, setError] = useState('')
  const [exitoMensaje, setExitoMensaje] = useState('')

  useEffect(() => {
    obtenerVentas()
      .then(setVentas)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  const ventasFiltradas = useMemo(() => {
    const valor = busqueda.trim().toLowerCase()

    if (!valor) {
      return ventas
    }

    return ventas.filter((venta) =>
      [
        venta.id.toString(),
        venta.fecha,
        venta.usuario,
        venta.cliente,
        venta.metodoPago,
        venta.total.toString(),
      ]
        .join(' ')
        .toLowerCase()
        .includes(valor),
    )
  }, [busqueda, ventas])

  const manejarCrearVenta = async (nuevaVenta) => {
    setCargandoCrear(true)
    setError('')
    setExitoMensaje('')

    try {
      await crearVenta(nuevaVenta)
      setExitoMensaje('¡Venta registrada exitosamente!')

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

      {/* Sección de formulario */}
      <section className="seccion-modulo">
        <h2 className="seccion-modulo__titulo">Nueva venta</h2>
        <VentaForm onCrearVenta={manejarCrearVenta} cargando={cargandoCrear} />
      </section>

      {/* Sección de búsqueda */}
      <section className="seccion-modulo">
        <h2 className="seccion-modulo__titulo">Historial de ventas</h2>

        <div className="buscador">
          <input
            type="text"
            className="buscador__entrada"
            placeholder="Buscar por ID, fecha, usuario, cliente, método de pago o monto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <VentasTable ventas={ventasFiltradas} cargando={cargando} error={error} />
      </section>
    </section>
  )
}

export default Ventas
