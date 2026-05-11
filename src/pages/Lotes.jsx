import { useEffect, useMemo, useState } from 'react'
import LotesTable from '../components/lotes/LotesTable'
import { obtenerLotes } from '../services/lotesService'

function Lotes() {
  const [lotes, setLotes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('Todos')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    obtenerLotes()
      .then(setLotes)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  const lotesFiltrados = useMemo(() => {
    const valor = busqueda.trim().toLowerCase()

    return lotes.filter((lote) => {
      const coincideBusqueda = [lote.codigo, lote.medicamento, lote.proveedor]
        .join(' ')
        .toLowerCase()
        .includes(valor)
      const coincideEstado = estadoSeleccionado === 'Todos' || lote.estado === estadoSeleccionado

      return coincideBusqueda && coincideEstado
    })
  }, [busqueda, estadoSeleccionado, lotes])

  return (
    <section className="lotes-pagina">
      <div className="encabezado-pagina">
        <span className="encabezado-pagina__etiqueta">Modulo de lotes</span>
        <h1>Lotes</h1>
        <p>
          Consulta entradas de inventario, stock disponible y alertas visuales de caducidad.
        </p>
      </div>

      <div className="modulo-resumen">
        <article className="indicador">
          <span>Vigentes</span>
          <strong>{lotes.filter((lote) => lote.estado === 'Vigente').length}</strong>
          <small>Lotes sin alerta</small>
        </article>
        <article className="indicador indicador--alerta">
          <span>Por caducar</span>
          <strong>{lotes.filter((lote) => lote.estado === 'Proximo').length}</strong>
          <small>Revisar pronto</small>
        </article>
        <article className="indicador indicador--riesgo">
          <span>Caducados</span>
          <strong>{lotes.filter((lote) => lote.estado === 'Caducado').length}</strong>
          <small>No vender</small>
        </article>
      </div>

      <div className="modulo-panel">
        <div className="modulo-panel__encabezado">
          <div>
            <h2>Listado de lotes</h2>
            <p>Los colores indican si el lote esta vigente, proximo a caducar o caducado.</p>
          </div>
          <div className="modulo-panel__filtros">
            <input
              aria-label="Buscar lote"
              className="buscador"
              placeholder="Buscar lote"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
            <select
              aria-label="Filtrar por estado"
              className="selector"
              value={estadoSeleccionado}
              onChange={(event) => setEstadoSeleccionado(event.target.value)}
            >
              <option>Todos</option>
              <option>Vigente</option>
              <option>Proximo</option>
              <option>Caducado</option>
            </select>
          </div>
        </div>

        {error && <div className="alerta-error">{error}</div>}
        {cargando ? (
          <p className="texto-secundario">Cargando lotes...</p>
        ) : (
          <LotesTable lotes={lotesFiltrados} />
        )}
      </div>
    </section>
  )
}

export default Lotes
