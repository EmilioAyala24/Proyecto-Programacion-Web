import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { obtenerLotes } from '../services/lotesService'
import { obtenerMedicamentos } from '../services/medicamentosService'

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
    return { estado: 'Proximo', texto: `${resumen.proximos} proximo(s)` }
  }

  return { estado: 'Vigente', texto: `${resumen.vigentes} vigente(s)` }
}

function MedicamentoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [medicamentos, setMedicamentos] = useState([])
  const [lotes, setLotes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [resumenAbierto, setResumenAbierto] = useState(false)

  useEffect(() => {
    Promise.all([obtenerMedicamentos(), obtenerLotes()])
      .then(([medicamentosDatos, lotesDatos]) => {
        setMedicamentos(medicamentosDatos)
        setLotes(lotesDatos)
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
              <span>Estado critico</span>
              <strong>{critico.estado === 'Proximo' ? 'Proximo' : critico.estado}</strong>
              <small>{critico.texto}</small>
            </article>
          </div>

          <div className="modulo-panel">
            <div className="detalle-medicamento-grid">
              <div>
                <span>Presentacion</span>
                <strong>{medicamento.presentacion}</strong>
              </div>
              <div>
                <span>Concentracion</span>
                <strong>{medicamento.concentracion}</strong>
              </div>
              <div>
                <span>Contenido</span>
                <strong>{medicamento.contenido}</strong>
              </div>
              <div>
                <span>Receta</span>
                <strong>{medicamento.requiereReceta ? 'Si' : 'No'}</strong>
              </div>
            </div>
          </div>

          <div className="modulo-panel">
            <div className="modulo-panel__encabezado">
              <div>
                <h2>Lotes asociados</h2>
                <p>El estado muestra primero los lotes caducados y despues los proximos a caducar.</p>
              </div>
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
                <span>Proximos a caducar: {resumen.proximos}</span>
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
                          {lote.estado === 'Proximo' ? 'Proximo a caducar' : lote.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default MedicamentoDetalle
