import { useEffect, useMemo, useState } from 'react'
import { obtenerLotesOcultos } from '../services/lotesService'
import { obtenerMedicamentos } from '../services/medicamentosService'
import { buscarCompradoresTrazabilidad } from '../services/trazabilidadService'

function fechaHoy() {
  return new Date().toISOString().slice(0, 10)
}

function fechaHaceDias(dias) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - dias)
  return fecha.toISOString().slice(0, 10)
}

function formatoPrecio(valor) {
  return Number(valor || 0).toFixed(2)
}

function Trazabilidad() {
  const [medicamentos, setMedicamentos] = useState([])
  const [lotesOcultos, setLotesOcultos] = useState([])
  const [registros, setRegistros] = useState([])
  const [filtros, setFiltros] = useState({
    desde: fechaHaceDias(90),
    hasta: fechaHoy(),
    idMedicamento: '',
    idLote: '',
  })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    Promise.all([obtenerMedicamentos(), obtenerLotesOcultos()])
      .then(([medicamentosDatos, lotesDatos]) => {
        setMedicamentos(medicamentosDatos)
        setLotesOcultos(lotesDatos)
      })
      .catch((err) => setError(err.message))
  }, [])

  const lotesFiltrados = useMemo(() => {
    if (!filtros.idMedicamento) {
      return lotesOcultos
    }

    return lotesOcultos.filter((lote) => String(lote.idMedicamento) === String(filtros.idMedicamento))
  }, [filtros.idMedicamento, lotesOcultos])

  const validarFiltros = () => {
    if (!filtros.desde || !filtros.hasta) {
      return 'Captura la fecha desde y hasta.'
    }

    if (new Date(`${filtros.desde}T00:00:00`) > new Date(`${filtros.hasta}T00:00:00`)) {
      return 'La fecha desde no puede ser posterior a la fecha hasta.'
    }

    return ''
  }

  const manejarBuscar = async (event) => {
    event.preventDefault()
    const errorValidacion = validarFiltros()

    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    setCargando(true)
    setError('')

    try {
      setRegistros(await buscarCompradoresTrazabilidad(filtros))
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="trazabilidad-pagina">
      <div className="encabezado-pagina">
        <span className="encabezado-pagina__etiqueta">Trazabilidad</span>
        <h1>Contacto por lote o medicamento</h1>
        <p>Localiza clientes que compraron medicamentos en un rango de fechas.</p>
      </div>

      {error && <div className="alerta-error">{error}</div>}

      <section className="modulo-panel">
        <div className="modulo-panel__encabezado">
          <div>
            <h2>Filtros de búsqueda</h2>
            <p>Usa esta vista cuando ocultes un lote por defecto, daño o retiro preventivo.</p>
          </div>
        </div>

        <form className="trazabilidad-filtros" onSubmit={manejarBuscar}>
          <div className="campo-formulario">
            <label htmlFor="traza-desde">Desde *</label>
            <input
              id="traza-desde"
              type="date"
              value={filtros.desde}
              onChange={(event) => setFiltros({ ...filtros, desde: event.target.value })}
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="traza-hasta">Hasta *</label>
            <input
              id="traza-hasta"
              type="date"
              value={filtros.hasta}
              onChange={(event) => setFiltros({ ...filtros, hasta: event.target.value })}
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="traza-medicamento">Medicamento</label>
            <select
              id="traza-medicamento"
              value={filtros.idMedicamento}
              onChange={(event) => setFiltros({
                ...filtros,
                idMedicamento: event.target.value,
                idLote: '',
              })}
            >
              <option value="">Todos</option>
              {medicamentos.map((medicamento) => (
                <option key={medicamento.id} value={medicamento.id}>
                  {medicamento.nombre} {medicamento.concentracion}
                </option>
              ))}
            </select>
          </div>

          <div className="campo-formulario">
            <label htmlFor="traza-lote">Lote oculto</label>
            <select
              id="traza-lote"
              value={filtros.idLote}
              onChange={(event) => {
                const lote = lotesOcultos.find((item) => String(item.id) === String(event.target.value))
                setFiltros({
                  ...filtros,
                  idLote: event.target.value,
                  idMedicamento: lote?.idMedicamento ? String(lote.idMedicamento) : filtros.idMedicamento,
                })
              }}
            >
              <option value="">Todos</option>
              {lotesFiltrados.map((lote) => (
                <option key={lote.id} value={lote.id}>
                  {lote.codigo} - {lote.medicamento} ({lote.motivoOculto || 'Oculto'})
                </option>
              ))}
            </select>
          </div>

          <button className="boton boton--primario" type="submit" disabled={cargando}>
            {cargando ? 'Buscando...' : 'Buscar compradores'}
          </button>
        </form>
      </section>

      <section className="modulo-panel">
        <div className="modulo-panel__encabezado">
          <div>
            <h2>Clientes encontrados</h2>
            <p>{registros.length} registro(s) dentro del rango seleccionado.</p>
          </div>
        </div>

        <div className="tabla-contenedor">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Venta</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Medicamento</th>
                <th>Lote</th>
                <th>Cant.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {registros.length === 0 ? (
                <tr>
                  <td colSpan="8">Sin resultados.</td>
                </tr>
              ) : registros.map((registro) => (
                <tr key={`${registro.idVenta}-${registro.idMedicamento}-${registro.idLote}`}>
                  <td>#{registro.idVenta}</td>
                  <td>{registro.fechaVenta}</td>
                  <td>{registro.cliente}</td>
                  <td>
                    {registro.telefono ? <a href={`tel:${registro.telefono}`}>{registro.telefono}</a> : '-'}
                    {registro.correo && (
                      <>
                        <br />
                        <a href={`mailto:${registro.correo}`}>{registro.correo}</a>
                      </>
                    )}
                  </td>
                  <td>{registro.medicamento} {registro.concentracion}</td>
                  <td>{registro.lote}</td>
                  <td>{registro.cantidad}</td>
                  <td>${formatoPrecio(registro.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}

export default Trazabilidad
