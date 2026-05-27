import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Modal from '../components/common/Modal'
import LoteForm from '../components/lotes/LoteForm'
import { crearLote, obtenerLotes } from '../services/lotesService'
import { obtenerMedicamentos } from '../services/medicamentosService'
import { obtenerProveedores } from '../services/proveedoresService'
import { obtenerQRLote } from '../services/qrsService'

const clasesEstado = {
  Vigente: 'vigente',
  Proximo: 'proximo',
  Caducado: 'caducado',
}

function formatearFecha(fecha) {
  if (!fecha) {
    return '-'
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${fecha}T00:00:00`))
}

function contarLotes(lotes) {
  return lotes.reduce(
    (totales, lote) => ({
      total: totales.total + 1,
      vigentes: totales.vigentes + (lote.estado === 'Vigente' ? 1 : 0),
      proximos: totales.proximos + (lote.estado === 'Proximo' ? 1 : 0),
      caducados: totales.caducados + (lote.estado === 'Caducado' ? 1 : 0),
    }),
    { total: 0, vigentes: 0, proximos: 0, caducados: 0 },
  )
}

function obtenerCritico(resumen) {
  if (resumen.caducados > 0) {
    return { estado: 'Caducado', texto: `${resumen.caducados} caducado(s)` }
  }

  if (resumen.proximos > 0) {
    return { estado: 'Proximo', texto: `${resumen.proximos} próximo(s)` }
  }

  return { estado: 'Vigente', texto: `${resumen.vigentes} vigente(s)` }
}

function formatearFechaLarga(fecha) {
  if (!fecha) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${fecha}T00:00:00`))
}

function MedicamentoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [medicamentos, setMedicamentos] = useState([])
  const [lotes, setLotes] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [resumenAbierto, setResumenAbierto] = useState(false)
  const [loteQR, setLoteQR] = useState(null)
  const [qrActual, setQrActual] = useState(null)
  const [cargandoQR, setCargandoQR] = useState(false)
  const [modalLoteAbierto, setModalLoteAbierto] = useState(false)

  useEffect(() => {
    Promise.all([obtenerMedicamentos(), obtenerLotes(), obtenerProveedores()])
      .then(([medicamentosDatos, lotesDatos, proveedoresDatos]) => {
        setMedicamentos(medicamentosDatos)
        setLotes(lotesDatos)
        setProveedores(proveedoresDatos)
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  const medicamento = useMemo(
    () => medicamentos.find((item) => String(item.id) === String(id)),
    [id, medicamentos],
  )

  const lotesDelMedicamento = useMemo(
    () => lotes.filter((lote) => String(lote.idMedicamento) === String(id)),
    [id, lotes],
  )

  const resumen = useMemo(() => contarLotes(lotesDelMedicamento), [lotesDelMedicamento])
  const critico = obtenerCritico(resumen)
  const formatoPrecio = (valor) => Number(valor || 0).toFixed(2)

  const abrirQRLote = async (lote) => {
    setLoteQR(lote)
    setQrActual(null)
    setCargandoQR(true)
    setError('')

    try {
      setQrActual(await obtenerQRLote(lote.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setCargandoQR(false)
    }
  }

  const manejarCrearLote = async (datos) => {
    try {
      const loteCreado = await crearLote({
        ...datos,
        idMedicamento: Number(id),
        medicamento: medicamento.nombre,
      })
      setLotes((actuales) => [loteCreado, ...actuales])
      setModalLoteAbierto(false)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="medicamento-detalle">
      <div className="encabezado-pagina encabezado-pagina--acciones">
        <div>
          <span className="encabezado-pagina__etiqueta">Medicamento</span>
          <h1>{medicamento?.nombre ?? 'Detalle del medicamento'}</h1>
          {medicamento && (
            <p>
              {medicamento.presentacion} / {medicamento.concentracion} / {medicamento.contenido}
            </p>
          )}
        </div>
        <button className="boton boton--secundario" type="button" onClick={() => navigate('/medicamentos')}>
          Volver
        </button>
      </div>

      {error && <div className="alerta-error">{error}</div>}

      {cargando ? (
        <p className="texto-secundario">Cargando medicamento...</p>
      ) : !medicamento ? (
        <div className="alerta-error">No se encontro el medicamento.</div>
      ) : (
        <>
          <div className="modulo-resumen">
            <article className="indicador">
              <span>Stock acumulado</span>
              <strong>{medicamento.stockDisponible}</strong>
              <small>Suma de todos sus lotes</small>
            </article>
            <article className="indicador">
              <span>Total lotes</span>
              <strong>{resumen.total}</strong>
              <small>Asignados</small>
            </article>
            <article className={`indicador indicador--${clasesEstado[critico.estado]}`}>
              <span>Estado crítico</span>
              <strong>{critico.estado === 'Proximo' ? 'Próximo' : critico.estado}</strong>
              <small>{critico.texto}</small>
            </article>
          </div>

          <div className="modulo-panel">
            <div className="detalle-medicamento-grid">
              <div>
                <span>Presentación</span>
                <strong>{medicamento.presentacion}</strong>
              </div>
              <div>
                <span>Concentración</span>
                <strong>{medicamento.concentracion}</strong>
              </div>
              <div>
                <span>Contenido</span>
                <strong>{medicamento.contenido}</strong>
              </div>
              <div>
                <span>Receta</span>
                <strong>{medicamento.requiereReceta ? 'Sí' : 'No'}</strong>
              </div>
            </div>
          </div>

          <div className="modulo-panel">
            <div className="modulo-panel__encabezado">
              <div>
                <h2>Lotes asociados</h2>
                <p>El estado muestra primero los lotes caducados y después los próximos a caducar.</p>
              </div>
              <button className="boton boton--primario" type="button" onClick={() => setModalLoteAbierto(true)}>
                Agregar lote
              </button>
              <button
                className={`lotes-resumen__boton lotes-resumen__boton--${clasesEstado[critico.estado]}`}
                type="button"
                onClick={() => setResumenAbierto((actual) => !actual)}
              >
                <span className="lotes-resumen__punto" />
                <strong>{critico.texto}</strong>
                <span aria-hidden="true">{resumenAbierto ? '-' : '+'}</span>
              </button>
            </div>

            {resumenAbierto && (
              <div className="lotes-desglose">
                <span>Total: {resumen.total}</span>
                <span>Bien: {resumen.vigentes}</span>
                <span>Próximos a caducar: {resumen.proximos}</span>
                <span>Caducados: {resumen.caducados}</span>
              </div>
            )}

            <div className="tabla-contenedor">
              <table className="tabla-datos">
                <thead>
                  <tr>
                    <th>Lote</th>
                    <th>Proveedor</th>
                    <th>Stock</th>
                    <th>Ingreso</th>
                    <th>Caducidad</th>
                    <th>Precio compra</th>
                    <th>Precio venta</th>
                    <th>Estado</th>
                    <th>QR</th>
                  </tr>
                </thead>
                <tbody>
                  {lotesDelMedicamento.map((lote) => (
                    <tr key={lote.id}>
                      <td><strong>{lote.codigo}</strong></td>
                      <td>{lote.proveedor}</td>
                      <td>{lote.stockDisponible}</td>
                      <td>{formatearFecha(lote.fechaIngreso)}</td>
                      <td>{formatearFecha(lote.fechaCaducidad)}</td>
                      <td>${formatoPrecio(lote.precioCompra)}</td>
                      <td>${formatoPrecio(lote.precioVenta)}</td>
                      <td>
                        <span className={`estado estado--${clasesEstado[lote.estado]}`}>
                          {lote.estado === 'Proximo' ? 'Próximo a caducar' : lote.estado}
                        </span>
                      </td>
                      <td>
                        <button
                          className="boton-accion boton-accion--ticket"
                          type="button"
                          onClick={() => abrirQRLote(lote)}
                        >
                          QR
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Modal
            isOpen={Boolean(loteQR)}
            onClose={() => {
              setLoteQR(null)
              setQrActual(null)
            }}
            title="QR del lote"
            size="grande"
          >
            {loteQR && (
              <div className="lote-qr-modal">
                <div className="lote-qr-modal__media">
                  {cargandoQR ? (
                    <p className="texto-secundario">Generando QR...</p>
                  ) : qrActual ? (
                    <img src={qrActual.qr_image_url} alt={`QR del lote ${loteQR.codigo}`} />
                  ) : (
                    <p className="texto-secundario">No fue posible cargar el QR.</p>
                  )}
                </div>

                <div className="lote-qr-modal__info">
                  <span className="encabezado-pagina__etiqueta">Lote</span>
                  <h2>{loteQR.codigo}</h2>
                  <p>{medicamento.nombre}</p>

                  <div className="detalle-medicamento-grid">
                    <div>
                      <span>Proveedor</span>
                      <strong>{loteQR.proveedor}</strong>
                    </div>
                    <div>
                      <span>Stock</span>
                      <strong>{loteQR.stockDisponible}</strong>
                    </div>
                    <div>
                      <span>Ingreso</span>
                      <strong>{formatearFechaLarga(loteQR.fechaIngreso)}</strong>
                    </div>
                    <div>
                      <span>Caducidad</span>
                      <strong>{formatearFechaLarga(loteQR.fechaCaducidad)}</strong>
                    </div>
                    <div>
                      <span>Precio compra</span>
                      <strong>${formatoPrecio(loteQR.precioCompra)}</strong>
                    </div>
                    <div>
                      <span>Precio venta</span>
                      <strong>${formatoPrecio(loteQR.precioVenta)}</strong>
                    </div>
                  </div>

                  {qrActual && (
                    <a className="boton boton--primario" href={qrActual.url_qr} target="_blank" rel="noreferrer">
                      Abrir vista del QR
                    </a>
                  )}
                </div>
              </div>
            )}
          </Modal>

          <Modal
            isOpen={modalLoteAbierto}
            onClose={() => setModalLoteAbierto(false)}
            title="Agregar lote al medicamento"
          >
            <LoteForm
              medicamentoFijo={medicamento}
              proveedores={proveedores}
              onGuardar={manejarCrearLote}
            />
          </Modal>
        </>
      )}
    </section>
  )
}

export default MedicamentoDetalle
