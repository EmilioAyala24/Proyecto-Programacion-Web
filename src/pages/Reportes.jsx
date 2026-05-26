import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { obtenerClientes } from '../services/clientesService'
import { obtenerLotes } from '../services/lotesService'
import { obtenerMedicamentos } from '../services/medicamentosService'
import { obtenerVentas } from '../services/ventasService'

const coloresGrafico = ['#0f3d6e', '#1d7db4', '#38bdf8', '#a16207', '#b91c1c']

function IconoAmpliar() {
  return (
    <svg className="icono-ampliar" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9V4h5" />
      <path d="M4 4l6.5 6.5" />
      <path d="M15 4h5v5" />
      <path d="M20 4l-6.5 6.5" />
      <path d="M4 15v5h5" />
      <path d="M4 20l6.5-6.5" />
      <path d="M20 15v5h-5" />
      <path d="M20 20l-6.5-6.5" />
    </svg>
  )
}

function obtenerDiaCliente(cliente) {
  const coincidencia = String(cliente.fechaRegistro ?? '').match(/^(\d{2})-(\d{2})-(\d{4})/)

  if (!coincidencia) {
    return ''
  }

  const [, dia, mes, anio] = coincidencia
  return `${anio}-${mes}-${dia}`
}

function estaEnRango(fecha, desde, hasta) {
  if (!fecha) {
    return false
  }

  if (desde && fecha < desde) {
    return false
  }

  if (hasta && fecha > hasta) {
    return false
  }

  return true
}

function formatearFecha(fecha) {
  if (!fecha) {
    return 'Sin fecha'
  }

  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

function obtenerHoyISO() {
  const hoy = new Date()
  const anio = hoy.getFullYear()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

function crearHTMLPDF({ filtros, resumen, datosFiltrados, ventasPorDia, ventasPorMetodo }) {
  const formatoPrecio = (valor) => Number(valor || 0).toFixed(2)
  const periodo = filtros.desde || filtros.hasta
    ? `${filtros.desde ? formatearFecha(filtros.desde) : 'Inicio'} - ${filtros.hasta ? formatearFecha(filtros.hasta) : 'Actual'}`
    : 'Todos los registros'
  const filasVentasDia = ventasPorDia.map((dia) => `
    <tr>
      <td>${dia.fecha}</td>
      <td>${dia.ventas}</td>
      <td>$${formatoPrecio(dia.ingresos)}</td>
    </tr>
  `).join('')
  const filasMetodos = ventasPorMetodo.map((metodo) => `
    <tr>
      <td>${metodo.nombre}</td>
      <td>${metodo.ventas}</td>
      <td>$${formatoPrecio(metodo.total)}</td>
    </tr>
  `).join('')
  const filasCaducados = datosFiltrados.lotesCaducados.map((lote) => `
    <tr>
      <td>${lote.codigo}</td>
      <td>${lote.medicamento}</td>
      <td>${lote.proveedor}</td>
      <td>${formatearFecha(lote.fechaCaducidad)}</td>
      <td>${lote.stockDisponible}</td>
    </tr>
  `).join('')

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Reporte Farmacia Inclusiva</title>
        <style>
          body { color: #0f172a; font-family: Arial, sans-serif; margin: 0; padding: 28px; }
          h1 { color: #082f49; margin: 0 0 6px; }
          h2 { border-bottom: 2px solid #bfdbfe; color: #0f75ad; font-size: 18px; margin-top: 28px; padding-bottom: 8px; }
          p { color: #3f6684; margin: 0 0 16px; }
          .meta { display: grid; gap: 8px 28px; grid-template-columns: 1fr 1fr; margin: 18px 0 24px; }
          .meta strong { display: inline-block; min-width: 140px; }
          .cards { display: grid; gap: 10px; grid-template-columns: repeat(4, 1fr); margin-bottom: 22px; }
          .card { background: #eef7fc; border: 1px solid #bfdbfe; padding: 12px; }
          .card span { color: #3f6684; display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; }
          .card strong { color: #0f75ad; display: block; font-size: 24px; margin-top: 6px; }
          table { border-collapse: collapse; font-size: 12px; margin-top: 12px; width: 100%; }
          th { background: #e2edf6; }
          th, td { border: 1px solid #cbd5e1; padding: 7px; text-align: left; }
          footer { border-top: 1px solid #cbd5e1; color: #64748b; font-size: 11px; margin-top: 32px; padding-top: 10px; }
          @media print { body { padding: 18px; } }
        </style>
      </head>
      <body>
        <h1>Reporte de indicadores</h1>
        <p>Indicadores de ventas, clientes, medicamentos e inventario</p>

        <section class="meta">
          <div><strong>Empresa:</strong> Farmacia Inclusiva</div>
          <div><strong>Periodo:</strong> ${periodo}</div>
          <div><strong>Fecha de emision:</strong> ${new Date().toLocaleString('es-MX')}</div>
          <div><strong>Formato:</strong> PDF con texto seleccionable</div>
        </section>

        <section class="cards">
          <article class="card"><span>Ventas</span><strong>${datosFiltrados.ventas.length}</strong></article>
          <article class="card"><span>Ingresos</span><strong>$${formatoPrecio(resumen.ingresos)}</strong></article>
          <article class="card"><span>Clientes</span><strong>${datosFiltrados.clientes.length}</strong></article>
          <article class="card"><span>Caducados</span><strong>${datosFiltrados.lotesCaducados.length}</strong></article>
        </section>

        <h2>Ventas por dia</h2>
        <table>
          <thead><tr><th>Dia</th><th>Ventas</th><th>Ingresos</th></tr></thead>
          <tbody>${filasVentasDia || '<tr><td colspan="3">Sin ventas en el periodo.</td></tr>'}</tbody>
        </table>

        <h2>Metodos de pago</h2>
        <table>
          <thead><tr><th>Metodo</th><th>Ventas</th><th>Total</th></tr></thead>
          <tbody>${filasMetodos || '<tr><td colspan="3">Sin ventas en el periodo.</td></tr>'}</tbody>
        </table>

        <h2>Lotes caducados en el rango</h2>
        <table>
          <thead><tr><th>Lote</th><th>Medicamento</th><th>Proveedor</th><th>Caducidad</th><th>Stock</th></tr></thead>
          <tbody>${filasCaducados || '<tr><td colspan="5">No hay lotes caducados en el rango.</td></tr>'}</tbody>
        </table>

        <footer>Farmacia Inclusiva / Reporte generado desde el sistema administrativo</footer>
      </body>
    </html>
  `
}

function Reportes() {
  const [datos, setDatos] = useState({
    ventas: [],
    lotes: [],
    medicamentos: [],
    clientes: [],
  })
  const [filtros, setFiltros] = useState({ desde: '', hasta: '' })
  const [filtrosAplicados, setFiltrosAplicados] = useState({ desde: '', hasta: '' })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [errorFiltros, setErrorFiltros] = useState('')
  const [modalReporte, setModalReporte] = useState('')
  const formatoPrecio = (valor) => Number(valor || 0).toFixed(2)
  const hoyISO = obtenerHoyISO()

  useEffect(() => {
    Promise.all([
      obtenerVentas(),
      obtenerLotes(),
      obtenerMedicamentos(),
      obtenerClientes(),
    ])
      .then(([ventas, lotes, medicamentos, clientes]) => {
        setDatos({ ventas, lotes, medicamentos, clientes })
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  const aplicarFiltros = (event) => {
    event.preventDefault()

    if ((filtros.desde && filtros.desde > hoyISO) || (filtros.hasta && filtros.hasta > hoyISO)) {
      setErrorFiltros('No puedes seleccionar fechas futuras.')
      return
    }

    if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) {
      setErrorFiltros('La fecha "Desde" no puede ser mayor que la fecha "Hasta".')
      return
    }

    setErrorFiltros('')
    setFiltrosAplicados(filtros)
  }

  const limpiarFiltros = () => {
    const vacios = { desde: '', hasta: '' }
    setFiltros(vacios)
    setFiltrosAplicados(vacios)
    setErrorFiltros('')
  }

  const datosFiltrados = useMemo(() => {
    const { desde, hasta } = filtrosAplicados

    return {
      ventas: datos.ventas.filter((venta) => estaEnRango(venta.fecha_venta_dia, desde, hasta)),
      clientes: datos.clientes.filter((cliente) => estaEnRango(obtenerDiaCliente(cliente), desde, hasta)),
      lotesCaducados: datos.lotes.filter((lote) =>
        lote.estado === 'Caducado' && estaEnRango(lote.fechaCaducidad, desde, hasta),
      ),
      lotes: datos.lotes,
      medicamentos: datos.medicamentos,
    }
  }, [datos, filtrosAplicados])

  const resumen = useMemo(() => {
    const ingresos = datosFiltrados.ventas.reduce((total, venta) => total + Number(venta.total || 0), 0)
    const productosVendidos = datosFiltrados.ventas.reduce(
      (total, venta) => total + Number(venta.cantidad_medicamentos || 0),
      0,
    )
    const stockTotal = datos.lotes.reduce((total, lote) => total + Number(lote.stockDisponible || 0), 0)
    const lotesProximos = datos.lotes.filter((lote) => lote.estado === 'Proximo').length
    const lotesCaducadosTotales = datos.lotes.filter((lote) => lote.estado === 'Caducado').length
    const ticketPromedio = datosFiltrados.ventas.length > 0 ? ingresos / datosFiltrados.ventas.length : 0

    const ventasPorUsuario = datosFiltrados.ventas.reduce((usuarios, venta) => {
      const usuario = venta.usuario || 'Sin asignar'
      const actual = usuarios[usuario] || { ventas: 0, total: 0 }
      usuarios[usuario] = {
        ventas: actual.ventas + 1,
        total: actual.total + Number(venta.total || 0),
      }
      return usuarios
    }, {})

    const vendedorDestacado = Object.entries(ventasPorUsuario)
      .map(([nombre, valores]) => ({ nombre, ...valores }))
      .sort((a, b) => b.total - a.total)[0]

    const topMedicamentos = [...datos.medicamentos]
      .sort((a, b) => Number(b.stockDisponible || 0) - Number(a.stockDisponible || 0))
      .slice(0, 5)

    return {
      ingresos,
      productosVendidos,
      stockTotal,
      lotesProximos,
      lotesCaducadosTotales,
      ticketPromedio,
      vendedorDestacado,
      topMedicamentos,
    }
  }, [datos, datosFiltrados])

  const ventasPorMetodo = useMemo(() => {
    const metodos = datosFiltrados.ventas.reduce((acumulado, venta) => {
      const metodo = venta.metodoPago || 'No especificado'
      const actual = acumulado[metodo] || { nombre: metodo, ventas: 0, total: 0 }
      acumulado[metodo] = {
        ...actual,
        ventas: actual.ventas + 1,
        total: actual.total + Number(venta.total || 0),
      }
      return acumulado
    }, {})

    return Object.values(metodos).sort((a, b) => b.total - a.total)
  }, [datosFiltrados.ventas])

  const ventasPorDia = useMemo(() => {
    const dias = datosFiltrados.ventas.reduce((acumulado, venta) => {
      const dia = venta.fecha_venta_dia || 'Sin fecha'
      const actual = acumulado[dia] || { fecha: dia, ventas: 0, ingresos: 0 }
      acumulado[dia] = {
        ...actual,
        ventas: actual.ventas + 1,
        ingresos: actual.ingresos + Number(venta.total || 0),
      }
      return acumulado
    }, {})

    return Object.values(dias).sort((a, b) => a.fecha.localeCompare(b.fecha))
  }, [datosFiltrados.ventas])

  const caducadosPorMes = useMemo(() => {
    const meses = datosFiltrados.lotesCaducados.reduce((acumulado, lote) => {
      const mes = lote.fechaCaducidad ? lote.fechaCaducidad.slice(0, 7) : 'Sin fecha'
      acumulado[mes] = (acumulado[mes] || 0) + 1
      return acumulado
    }, {})

    return Object.entries(meses)
      .map(([mes, total]) => ({ mes, total }))
      .sort((a, b) => a.mes.localeCompare(b.mes))
  }, [datosFiltrados.lotesCaducados])

  const generarPDF = () => {
    const ventana = window.open('', '_blank', 'width=900,height=720')

    if (!ventana) {
      setError('No se pudo abrir el PDF. Permite ventanas emergentes en el navegador.')
      return
    }

    ventana.document.open()
    ventana.document.write(crearHTMLPDF({
      filtros: filtrosAplicados,
      resumen,
      datosFiltrados,
      ventasPorDia,
      ventasPorMetodo,
    }))
    ventana.document.close()
    ventana.focus()
    setTimeout(() => ventana.print(), 350)
  }

  return (
    <section className="reportes-pagina">
      <div className="encabezado-pagina encabezado-pagina--acciones">
        <div>
          <span className="encabezado-pagina__etiqueta">Modulo de reportes</span>
          <h1>Reportes</h1>
          <p>Indicadores de ventas, medicamentos, clientes e inventario.</p>
        </div>
        <button className="boton boton--primario" type="button" onClick={generarPDF} disabled={cargando}>
          Descargar PDF
        </button>
      </div>

      <form className="reportes-filtros" onSubmit={aplicarFiltros} noValidate>
        <strong>Periodo</strong>
        <label>
          Desde
          <input
            type="date"
            max={hoyISO}
            value={filtros.desde}
            onChange={(event) => setFiltros((actual) => ({ ...actual, desde: event.target.value }))}
          />
        </label>
        <label>
          Hasta
          <input
            type="date"
            max={hoyISO}
            value={filtros.hasta}
            onChange={(event) => setFiltros((actual) => ({ ...actual, hasta: event.target.value }))}
          />
        </label>
        <button className="boton boton--primario" type="submit">Generar</button>
        <button className="boton boton--secundario" type="button" onClick={limpiarFiltros}>Limpiar</button>
      </form>

      {errorFiltros && <div className="alerta-error">{errorFiltros}</div>}
      {error && <div className="alerta-error">{error}</div>}

      {cargando ? (
        <p className="texto-secundario">Cargando reportes...</p>
      ) : (
        <>
          <div className="modulo-resumen modulo-resumen--reportes">
            <article className="indicador">
              <span>Ingresos</span>
              <strong>${formatoPrecio(resumen.ingresos)}</strong>
              <small>Total vendido en el periodo</small>
            </article>
            <article className="indicador">
              <span>Ventas</span>
              <strong>{datosFiltrados.ventas.length}</strong>
              <small>Transacciones filtradas</small>
            </article>
            <article className="indicador">
              <span>Productos</span>
              <strong>{resumen.productosVendidos}</strong>
              <small>Unidades vendidas</small>
            </article>
            <article className="indicador">
              <span>Ticket promedio</span>
              <strong>${formatoPrecio(resumen.ticketPromedio)}</strong>
              <small>Promedio por venta</small>
            </article>
            <article className="indicador indicador--alerta">
              <span>Caducados en rango</span>
              <strong>{datosFiltrados.lotesCaducados.length}</strong>
              <small>Lotes que caducaron en el periodo</small>
            </article>
            <article className="indicador">
              <span>Clientes nuevos</span>
              <strong>{datosFiltrados.clientes.length}</strong>
              <small>Altas en el periodo</small>
            </article>
          </div>

          <div className="reportes-dashboard">
            <article className="modulo-panel">
              <div className="modulo-panel__encabezado">
                <div>
                  <h2>Ventas por dia</h2>
                  <p>Ingresos diarios dentro del rango seleccionado.</p>
                </div>
              </div>
              <div className="grafico-reportes">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={ventasPorDia}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${formatoPrecio(value)}`} />
                    <Bar dataKey="ingresos" name="Ingresos" fill="#1d7db4" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="modulo-panel">
              <div className="modulo-panel__encabezado">
                <div>
                  <h2>Metodos de pago</h2>
                  <p>Distribucion de ventas por forma de pago.</p>
                </div>
              </div>
              <div className="grafico-reportes">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={ventasPorMetodo}
                      dataKey="total"
                      nameKey="nombre"
                      innerRadius={64}
                      outerRadius={96}
                      paddingAngle={3}
                    >
                      {ventasPorMetodo.map((item, index) => (
                        <Cell key={item.nombre} fill={coloresGrafico[index % coloresGrafico.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${formatoPrecio(value)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>

          <div className="reportes-grid">
            <article className="modulo-panel">
              <div className="modulo-panel__encabezado">
                <div>
                  <h2>Lotes caducados en el rango</h2>
                  <p>{datosFiltrados.lotesCaducados.length} lote(s) encontrados.</p>
                </div>
                <button className="boton boton--discreto boton--icono" type="button" onClick={() => setModalReporte('caducados')}>
                  <IconoAmpliar />
                  <span className="sr-only">Ampliar</span>
                </button>
              </div>
              <div className="reporte-resumen-compacto">
                <strong>{datosFiltrados.lotesCaducados.length}</strong>
                <span>caducados en el periodo</span>
                <small>
                  {datosFiltrados.lotesCaducados[0]
                    ? `Mas reciente: ${datosFiltrados.lotesCaducados[0].codigo}`
                    : 'Sin caducidades en el rango'}
                </small>
              </div>
            </article>

            <article className="modulo-panel">
              <div className="modulo-panel__encabezado">
                <div>
                  <h2>Caducados por mes</h2>
                  <p>{caducadosPorMes.length} mes(es) con caducidades.</p>
                </div>
                <button className="boton boton--discreto boton--icono" type="button" onClick={() => setModalReporte('caducadosMes')}>
                  <IconoAmpliar />
                  <span className="sr-only">Ampliar</span>
                </button>
              </div>
              <div className="reporte-resumen-compacto">
                <strong>{caducadosPorMes.reduce((total, item) => total + item.total, 0)}</strong>
                <span>caducidades agrupadas</span>
                <small>{caducadosPorMes[0] ? `Primer mes: ${caducadosPorMes[0].mes}` : 'Sin datos para graficar'}</small>
              </div>
            </article>

            <article className="modulo-panel">
              <div className="modulo-panel__encabezado">
                <div>
                  <h2>Medicamentos con mas stock</h2>
                  <p>Top {resumen.topMedicamentos.length} del inventario actual.</p>
                </div>
                <button className="boton boton--discreto boton--icono" type="button" onClick={() => setModalReporte('stock')}>
                  <IconoAmpliar />
                  <span className="sr-only">Ampliar</span>
                </button>
              </div>
              <div className="reporte-resumen-compacto">
                <strong>{resumen.topMedicamentos[0]?.stockDisponible ?? 0}</strong>
                <span>unidades del medicamento lider</span>
                <small>{resumen.topMedicamentos[0]?.nombre ?? 'Sin medicamentos'}</small>
              </div>
            </article>

            <article className="modulo-panel">
              <div className="modulo-panel__encabezado">
                <div>
                  <h2>Resumen de inventario</h2>
                  <p>Estado general de lotes actuales.</p>
                </div>
                <button className="boton boton--discreto boton--icono" type="button" onClick={() => setModalReporte('inventario')}>
                  <IconoAmpliar />
                  <span className="sr-only">Ampliar</span>
                </button>
              </div>
              <div className="reporte-resumen-compacto">
                <strong>{resumen.stockTotal}</strong>
                <span>unidades disponibles</span>
                <small>{resumen.lotesProximos + resumen.lotesCaducadosTotales} lote(s) requieren revision</small>
              </div>
            </article>
          </div>

          {modalReporte && (
            <div className="modal-reporte" role="dialog" aria-modal="true">
              <button className="modal-reporte__fondo" type="button" aria-label="Cerrar reporte" onClick={() => setModalReporte('')} />
              <section className="modal-reporte__panel">
                <button className="modal-reporte__cerrar" type="button" aria-label="Cerrar" onClick={() => setModalReporte('')}>
                  x
                </button>

                {modalReporte === 'caducados' && (
                <>
                  <div className="modulo-panel__encabezado">
                    <div>
                      <h2>Detalle completo de lotes caducados</h2>
                      <p>Informacion completa de caducidades dentro del rango seleccionado.</p>
                    </div>
                  </div>
                  <div className="tabla-contenedor">
                    <table className="tabla-datos tabla--compacta">
                      <thead>
                        <tr>
                          <th>Lote</th>
                          <th>Medicamento</th>
                          <th>Proveedor</th>
                          <th>Caducidad</th>
                          <th>Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datosFiltrados.lotesCaducados.map((lote) => (
                          <tr key={lote.id}>
                            <td>{lote.codigo}</td>
                            <td>{lote.medicamento}</td>
                            <td>{lote.proveedor}</td>
                            <td>{formatearFecha(lote.fechaCaducidad)}</td>
                            <td>{lote.stockDisponible}</td>
                          </tr>
                        ))}
                        {datosFiltrados.lotesCaducados.length === 0 && (
                          <tr>
                            <td colSpan="5">No hay lotes caducados en el rango.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

                {modalReporte === 'caducadosMes' && (
                <>
                  <div className="modulo-panel__encabezado">
                    <div>
                      <h2>Caducados por mes completo</h2>
                      <p>Grafica expandida con los meses del rango.</p>
                    </div>
                  </div>
                  <div className="grafico-reportes">
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={caducadosPorMes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="total" name="Lotes caducados" fill="#b91c1c" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}

                {modalReporte === 'stock' && (
                <>
                  <div className="modulo-panel__encabezado">
                    <div>
                      <h2>Detalle completo de medicamentos con mas stock</h2>
                      <p>Inventario actual ordenado por unidades disponibles.</p>
                    </div>
                  </div>
                  <div className="tabla-contenedor">
                    <table className="tabla-datos tabla--compacta">
                      <thead>
                        <tr>
                          <th>Medicamento</th>
                          <th>Presentacion</th>
                          <th>Concentracion</th>
                          <th>Stock</th>
                          <th>Lotes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...datos.medicamentos]
                          .sort((a, b) => Number(b.stockDisponible || 0) - Number(a.stockDisponible || 0))
                          .map((medicamento) => (
                            <tr key={medicamento.id}>
                              <td>{medicamento.nombre}</td>
                              <td>{medicamento.presentacion}</td>
                              <td>{medicamento.concentracion}</td>
                              <td>{medicamento.stockDisponible}</td>
                              <td>{medicamento.totalLotes}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

                {modalReporte === 'inventario' && (
                <>
                  <div className="modulo-panel__encabezado">
                    <div>
                      <h2>Resumen de inventario completo</h2>
                      <p>Indicadores generales y vendedor destacado.</p>
                    </div>
                  </div>
                  <div className="reporte-lista">
                    <span>Stock total: <strong>{resumen.stockTotal}</strong></span>
                    <span>Proximos a caducar: <strong>{resumen.lotesProximos}</strong></span>
                    <span>Caducados totales: <strong>{resumen.lotesCaducadosTotales}</strong></span>
                    <span>
                      Vendedor destacado:{' '}
                      <strong>
                        {resumen.vendedorDestacado
                          ? `${resumen.vendedorDestacado.nombre} / $${formatoPrecio(resumen.vendedorDestacado.total)}`
                          : 'Sin ventas'}
                      </strong>
                    </span>
                  </div>
                </>
              )}
              </section>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default Reportes
