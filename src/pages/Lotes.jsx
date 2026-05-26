import { useEffect, useMemo, useState } from 'react'
import AddButton from '../components/common/AddButton'
import DetalleRegistro from '../components/common/DetalleRegistro'
import Modal from '../components/common/Modal'
import Paginacion from '../components/common/Paginacion'
import FiltrosLotes from '../components/filtros/FiltrosLotes'
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
import { obtenerQRLote } from '../services/qrsService'

function Lotes() {
  const [lotes, setLotes] = useState([])
  const [filtros, setFiltros] = useState({
    busqueda: '',
    stock: '',
    caducidad: '',
    medicamento: '',
  })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [proveedores, setProveedores] = useState([])
  const [medicamentos, setMedicamentos] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [loteEditando, setLoteEditando] = useState(null)
  const [loteViendo, setLoteViendo] = useState(null)
  const [loteQR, setLoteQR] = useState(null)
  const [qrActual, setQrActual] = useState(null)
  const [errorQR, setErrorQR] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const registrosPorPagina = 8
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
    const valor = filtros.busqueda.trim().toLowerCase()

    return lotes.filter((lote) => {
      const coincideBusqueda = [lote.codigo, lote.medicamento, lote.proveedor]
        .join(' ')
        .toLowerCase()
        .includes(valor)
      const coincideEstado = !filtros.caducidad || lote.estado === filtros.caducidad
      const coincideStock =
        !filtros.stock ||
        (filtros.stock === 'con-stock' && lote.stockDisponible > 0) ||
        (filtros.stock === 'sin-stock' && lote.stockDisponible <= 0)
      const coincideMedicamento =
        !filtros.medicamento || String(lote.idMedicamento) === String(filtros.medicamento)

      return coincideBusqueda && coincideEstado && coincideStock && coincideMedicamento
    })
  }, [filtros, lotes])

  const totalPaginas = Math.max(1, Math.ceil(lotesFiltrados.length / registrosPorPagina))
  const lotesPaginados = lotesFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina,
  )

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

  const manejarVerQR = async (lote) => {
    try {
      setLoteQR(lote)
      setQrActual(null)
      setErrorQR('')
      setQrActual(await obtenerQRLote(lote.id))
      setError('')
    } catch (err) {
      setErrorQR(err.message)
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

        <FiltrosLotes
          filtros={filtros}
          medicamentos={medicamentosCatalogo}
          onChange={(nuevosFiltros) => {
            setFiltros(nuevosFiltros)
            setPaginaActual(1)
          }}
        />

        {error && <div className="alerta-error">{error}</div>}
        {cargando ? (
          <p className="texto-secundario">Cargando lotes...</p>
        ) : (
          <LotesTable
            lotes={lotesPaginados}
            onEditar={setLoteEditando}
            onEliminar={manejarEliminarLote}
            onVer={setLoteViendo}
            onQR={manejarVerQR}
          />
        )}
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalRegistros={lotesFiltrados.length}
          onChange={setPaginaActual}
        />
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

      <Modal
        isOpen={Boolean(loteQR)}
        onClose={() => {
          setLoteQR(null)
          setQrActual(null)
          setErrorQR('')
        }}
        title="QR del lote"
      >
        {loteQR && (
          <div className="qr-lote">
            <div>
              <span className="qr-lote__etiqueta">Lote</span>
              <h3>{loteQR.codigo}</h3>
              <p>{loteQR.medicamento}</p>
            </div>
            {qrActual ? (
              <>
                <img src={qrActual.qr_image_url} alt={`QR del lote ${loteQR.codigo}`} />
                <a className="boton boton--primario" href={qrActual.url_qr} target="_blank" rel="noreferrer">
                  Abrir vista del QR
                </a>
                <p className="texto-secundario">{qrActual.url_qr}</p>
              </>
            ) : errorQR ? (
              <div className="alerta-error">{errorQR}</div>
            ) : (
              <p className="texto-secundario">Generando QR...</p>
            )}
          </div>
        )}
      </Modal>
    </section>
  )
}

export default Lotes
