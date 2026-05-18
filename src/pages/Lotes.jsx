import { useEffect, useMemo, useState } from 'react'
import AddButton from '../components/common/AddButton'
import DetalleRegistro from '../components/common/DetalleRegistro'
import Modal from '../components/common/Modal'
import LoteForm from '../components/lotes/LoteForm'
import LotesTable from '../components/lotes/LotesTable'
import {
  actualizarLote,
  crearLote,
  eliminarLote,
  obtenerLotes,
} from '../services/lotesService'
import { obtenerMedicamentos } from '../services/medicamentosService'
import { obtenerProveedores } from '../services/proveedoresService'

function Lotes() {
  const [lotes, setLotes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('Todos')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [proveedores, setProveedores] = useState([])
  const [medicamentos, setMedicamentos] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [loteEditando, setLoteEditando] = useState(null)
  const [loteViendo, setLoteViendo] = useState(null)
  const formatoPrecio = (valor) => Number(valor || 0).toFixed(2)

  useEffect(() => {
    Promise.all([obtenerLotes(), obtenerProveedores(), obtenerMedicamentos()])
      .then(([lotesDatos, proveedoresDatos, medicamentosDatos]) => {
        setLotes(lotesDatos)
        setProveedores(proveedoresDatos)
        setMedicamentos(medicamentosDatos)
      })
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

  const medicamentosCatalogo = useMemo(() => {
    const mapa = new Map()

    medicamentos.forEach((medicamento) => {
      const llave = [
        medicamento.nombre,
        medicamento.presentacion,
        medicamento.concentracion,
      ].join('|')

      if (!mapa.has(llave)) {
        mapa.set(llave, medicamento)
      }
    })

    return Array.from(mapa.values())
  }, [medicamentos])

  const manejarCrearLote = async (datos) => {
    try {
      const loteCreado = await crearLote(datos)
      setLotes((actuales) => [loteCreado, ...actuales])
      setModalAbierto(false)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  const manejarActualizarLote = async (datos) => {
    try {
      const loteActualizado = await actualizarLote(loteEditando.id, datos)
      setLotes((actuales) =>
        actuales.map((lote) => (lote.id === loteActualizado.id ? loteActualizado : lote)),
      )
      setLoteEditando(null)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  const manejarEliminarLote = async (id) => {
    if (!window.confirm('Estas seguro de que deseas eliminar este lote?')) {
      return
    }

    try {
      await eliminarLote(id)
      setLotes((actuales) => actuales.filter((lote) => lote.id !== id))
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

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
          <AddButton
            onClick={() => setModalAbierto(true)}
            title="Agregar nuevo lote"
          />
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

        {error && <div className="alerta-error">{error}</div>}
        {cargando ? (
          <p className="texto-secundario">Cargando lotes...</p>
        ) : (
          <LotesTable
            lotes={lotesFiltrados}
            onEditar={setLoteEditando}
            onEliminar={manejarEliminarLote}
            onVer={setLoteViendo}
          />
        )}
      </div>

      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Registrar nuevo lote"
      >
        <LoteForm
          medicamentos={medicamentosCatalogo}
          proveedores={proveedores}
          onGuardar={manejarCrearLote}
        />
      </Modal>

      <Modal
        isOpen={Boolean(loteEditando)}
        onClose={() => setLoteEditando(null)}
        title="Editar lote"
      >
        <LoteForm
          loteInicial={loteEditando}
          medicamentos={medicamentosCatalogo}
          proveedores={proveedores}
          onGuardar={manejarActualizarLote}
        />
      </Modal>

      <Modal
        isOpen={Boolean(loteViendo)}
        onClose={() => setLoteViendo(null)}
        title="Detalle del lote"
      >
        {loteViendo && (
          <DetalleRegistro
            campos={[
              { etiqueta: 'Lote', valor: loteViendo.codigo },
              { etiqueta: 'Medicamento', valor: loteViendo.medicamento },
              { etiqueta: 'Proveedor', valor: loteViendo.proveedor },
              { etiqueta: 'Stock', valor: loteViendo.stockDisponible },
              { etiqueta: 'Ingreso', valor: loteViendo.fechaIngreso },
              { etiqueta: 'Caducidad', valor: loteViendo.fechaCaducidad },
              { etiqueta: 'Precio compra', valor: `$${formatoPrecio(loteViendo.precioCompra)}` },
              { etiqueta: 'Precio venta', valor: `$${formatoPrecio(loteViendo.precioVenta)}` },
              { etiqueta: 'Estado', valor: loteViendo.estado },
            ]}
          />
        )}
      </Modal>
    </section>
  )
}

export default Lotes
