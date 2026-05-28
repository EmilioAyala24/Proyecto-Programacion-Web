import { useEffect, useMemo, useState } from 'react'
import AddButton from '../components/common/AddButton'
import DetalleRegistro from '../components/common/DetalleRegistro'
import Modal from '../components/common/Modal'
import Paginacion from '../components/common/Paginacion'
import FiltrosVentas from '../components/filtros/FiltrosVentas'
import VentaForm from '../components/ventas/VentaForm'
import VentasTable from '../components/ventas/VentasTable'
import { useAuth } from '../hooks/useAuth'
import { crearVenta, eliminarVenta, obtenerDetalleVenta, obtenerVentas } from '../services/ventasService'

function escaparHtml(valor) {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function crearUrlPublicaTicket(idVenta) {
  return `${window.location.origin}/ticket/${idVenta}`
}

function crearUrlImagenQR(url) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`
}

function formatearFechaTicket(fecha) {
  if (!fecha) {
    return 'Sin fecha'
  }

  const [year, month, day] = String(fecha).split('T')[0].split('-')
  return year && month && day ? `${day}-${month}-${year}` : String(fecha)
}

function crearHtmlTicket(venta, detalles) {
  const formatoPrecio = (valor) => Number(valor || 0).toFixed(2)
  const tasaIva = 0.16
  const total = Number(venta.total || 0)
  const subtotalSinIva = total / (1 + tasaIva)
  const iva = total - subtotalSinIva
  const urlTicket = crearUrlPublicaTicket(venta.id)
  const qrTicket = crearUrlImagenQR(urlTicket)
  const filas = detalles.map((detalle) => `
    <tr>
      <td>
        <strong>${escaparHtml(detalle.medicamento)}</strong>
        <span>${escaparHtml([detalle.presentacion, detalle.concentracion].filter(Boolean).join(' '))}</span>
        <span>Lote ${escaparHtml(detalle.numeroLote || detalle.numero_lote || 'N/D')} / Cad. ${escaparHtml(formatearFechaTicket(detalle.fechaCaducidad || detalle.fecha_caducidad))}</span>
      </td>
      <td>${escaparHtml(detalle.cantidad)}</td>
      <td>$${formatoPrecio(detalle.precio_unitario)}</td>
      <td>$${formatoPrecio(detalle.subtotal)}</td>
    </tr>
  `).join('')

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Ticket venta #${escaparHtml(venta.id)}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 4mm;
          }
          * { box-sizing: border-box; }
          body {
            color: #0f172a;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 12px;
          }
          .ticket {
            margin: 0 auto;
            max-width: 302px;
            text-align: center;
          }
          .ticket__encabezado {
            border-bottom: 1px dashed #94a3b8;
            margin-bottom: 10px;
            padding-bottom: 10px;
            text-align: center;
          }
          .ticket__encabezado h1 {
            font-size: 18px;
            margin: 0 0 4px;
          }
          .ticket__encabezado p,
          .ticket__datos p,
          .ticket__pie p {
            margin: 3px 0;
          }
          .ticket__datos {
            border-bottom: 1px dashed #94a3b8;
            font-size: 12px;
            margin-bottom: 10px;
            padding-bottom: 10px;
            text-align: center;
          }
          .ticket__datos strong {
            display: inline-block;
            min-width: 88px;
            text-align: right;
          }
          table {
            border-collapse: collapse;
            font-size: 11px;
            margin: 0 auto;
            width: 100%;
          }
          th {
            border-bottom: 1px solid #cbd5e1;
            text-align: center;
          }
          th,
          td {
            padding: 6px 3px;
            vertical-align: top;
          }
          td:nth-child(2),
          td:nth-child(3),
          td:nth-child(4),
          th:nth-child(2),
          th:nth-child(3),
          th:nth-child(4) {
            text-align: center;
          }
          td:first-child,
          th:first-child {
            text-align: left;
          }
          td span {
            color: #475569;
            display: block;
            font-size: 10px;
            margin-top: 2px;
          }
          .ticket__total {
            border-top: 1px dashed #94a3b8;
            margin-top: 12px;
            padding-top: 12px;
          }
          .ticket__total p {
            display: flex;
            font-size: 12px;
            justify-content: space-between;
            margin: 4px 0;
          }
          .ticket__total p:last-child {
            font-size: 18px;
            font-weight: 800;
            margin-top: 8px;
          }
          .ticket__qr {
            border-top: 1px dashed #94a3b8;
            margin-top: 12px;
            padding-top: 12px;
            text-align: center;
          }
          .ticket__qr img {
            height: 132px;
            image-rendering: pixelated;
            margin: 6px auto;
            width: 132px;
          }
          .ticket__qr a {
            color: #0f3d6e;
            display: block;
            font-size: 10px;
            overflow-wrap: anywhere;
            text-decoration: none;
          }
          .ticket__pie {
            color: #475569;
            font-size: 11px;
            margin-top: 14px;
            text-align: center;
          }
          .acciones {
            display: flex;
            gap: 8px;
            justify-content: center;
            margin: 18px auto 0;
            max-width: 360px;
          }
          button {
            background: #0f3d6e;
            border: 0;
            border-radius: 8px;
            color: #fff;
            cursor: pointer;
            font-weight: 700;
            padding: 10px 14px;
          }
          @media print {
            html,
            body {
              background: #ffffff;
              height: auto;
              margin: 0;
              padding: 0;
              width: 80mm;
            }
            .ticket {
              margin: 0;
              max-width: none;
              padding: 0;
              width: 72mm;
            }
            .ticket__encabezado h1 {
              font-size: 15pt;
            }
            .ticket__encabezado p {
              font-size: 11pt;
            }
            .ticket__datos {
              font-size: 9pt;
            }
            table {
              font-size: 8.5pt;
            }
            td span {
              font-size: 7.5pt;
            }
            .ticket__total {
              font-size: 14pt;
            }
            .ticket__qr img {
              height: 32mm;
              width: 32mm;
            }
            .ticket__pie {
              font-size: 8pt;
            }
            .acciones { display: none; }
          }
        </style>
      </head>
      <body>
        <main class="ticket">
          <section class="ticket__encabezado">
            <h1>Farmacia Inclusiva</h1>
            <p>Ticket de venta</p>
            <p>Folio #${escaparHtml(venta.id)}</p>
          </section>

          <section class="ticket__datos">
            <p><strong>Fecha:</strong> ${escaparHtml(venta.fecha)}</p>
            <p><strong>Cajero:</strong> ${escaparHtml(venta.usuario)}</p>
            <p><strong>Cliente:</strong> ${escaparHtml(venta.cliente)}</p>
            <p><strong>Método de pago:</strong> ${escaparHtml(venta.metodoPago)}</p>
          </section>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${filas || '<tr><td colspan="4">Sin productos registrados.</td></tr>'}
            </tbody>
          </table>

          <div class="ticket__total">
            <p><span>Subtotal</span><span>$${formatoPrecio(subtotalSinIva)}</span></p>
            <p><span>IVA 16%</span><span>$${formatoPrecio(iva)}</span></p>
            <p><span>Total</span><span>$${formatoPrecio(total)}</span></p>
          </div>

          <section class="ticket__qr">
            <p>Escanea para ver información de los medicamentos.</p>
            <img src="${escaparHtml(qrTicket)}" alt="QR del ticket" />
            <a href="${escaparHtml(urlTicket)}">${escaparHtml(urlTicket)}</a>
          </section>

          <section class="ticket__pie">
            <p>Gracias por su compra.</p>
            <p>Conserve este ticket para cualquier aclaracion.</p>
          </section>
        </main>

        <div class="acciones">
          <button type="button" onclick="window.print()">Imprimir ticket</button>
          <button type="button" onclick="window.close()">Cerrar</button>
        </div>
      </body>
    </html>
  `
}

function Ventas() {
  const { usuario } = useAuth()
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
  const [ventaEliminando, setVentaEliminando] = useState(null)
  const [autorizacionAdmin, setAutorizacionAdmin] = useState({
    adminUsuario: usuario?.rol === 'admin' ? usuario.usuario : '',
    adminPassword: '',
  })
  const [cargandoEliminar, setCargandoEliminar] = useState(false)
  const [detalleVenta, setDetalleVenta] = useState([])
  const [paginaActual, setPaginaActual] = useState(1)
  const registrosPorPagina = 8
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

  const totalPaginas = Math.max(1, Math.ceil(ventasFiltradas.length / registrosPorPagina))
  const ventasPaginadas = ventasFiltradas.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina,
  )

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

  const manejarGenerarTicket = async (venta) => {
    const ventanaTicket = window.open('', '_blank', 'width=420,height=720')

    if (!ventanaTicket) {
      setError('No se pudo abrir el ticket. Permite ventanas emergentes en el navegador.')
      return
    }

    try {
      ventanaTicket.document.write('<p style="font-family: Arial; padding: 20px;">Generando ticket...</p>')
      const detalles = ventaViendo?.id === venta.id && detalleVenta.length > 0
        ? detalleVenta
        : await obtenerDetalleVenta(venta.id)

      ventanaTicket.document.open()
      ventanaTicket.document.write(crearHtmlTicket(venta, detalles))
      ventanaTicket.document.close()
      ventanaTicket.focus()
    } catch (err) {
      ventanaTicket.close()
      setError(err.message)
    }
  }

  const abrirEliminarVenta = (venta) => {
    setVentaEliminando(venta)
    setAutorizacionAdmin({
      adminUsuario: usuario?.rol === 'admin' ? usuario.usuario : '',
      adminPassword: '',
    })
    setError('')
  }

  const cerrarEliminarVenta = () => {
    if (cargandoEliminar) {
      return
    }

    setVentaEliminando(null)
    setAutorizacionAdmin({
      adminUsuario: usuario?.rol === 'admin' ? usuario.usuario : '',
      adminPassword: '',
    })
  }

  const manejarEliminarVenta = async (event) => {
    event.preventDefault()

    if (!ventaEliminando) {
      return
    }

    setCargandoEliminar(true)
    setError('')
    setExitoMensaje('')

    try {
      await eliminarVenta(ventaEliminando.id, autorizacionAdmin)
      setExitoMensaje(`Venta #${ventaEliminando.id} eliminada. El stock fue restaurado.`)
      setVentaEliminando(null)
      setDetalleVenta([])
      setVentaViendo(null)
      setVentas(await obtenerVentas())
      setTimeout(() => setExitoMensaje(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargandoEliminar(false)
      setAutorizacionAdmin((actual) => ({ ...actual, adminPassword: '' }))
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

        <FiltrosVentas
          filtros={filtros}
          onChange={(nuevosFiltros) => {
            setFiltros(nuevosFiltros)
            setPaginaActual(1)
          }}
        />

        <VentasTable
          ventas={ventasPaginadas}
          cargando={cargando}
          error={error}
          onVer={manejarVerVenta}
          onTicket={manejarGenerarTicket}
          onEliminar={abrirEliminarVenta}
        />
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalRegistros={ventasFiltradas.length}
          onChange={setPaginaActual}
        />
      </section>

      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Registrar nueva venta"
        size="grande"
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
            <div className="detalle-venta__acciones">
              <button
                className="boton boton--primario"
                type="button"
                onClick={() => manejarGenerarTicket(ventaViendo)}
              >
                Generar ticket
              </button>
            </div>
            <DetalleRegistro
              campos={[
                { etiqueta: 'Venta', valor: `#${ventaViendo.id}` },
                { etiqueta: 'Fecha', valor: ventaViendo.fecha },
                { etiqueta: 'Usuario', valor: ventaViendo.usuario },
                { etiqueta: 'Cliente', valor: ventaViendo.cliente },
                { etiqueta: 'Método de pago', valor: ventaViendo.metodoPago },
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

      <Modal
        isOpen={Boolean(ventaEliminando)}
        onClose={cerrarEliminarVenta}
        title="Eliminar venta"
      >
        {ventaEliminando && (
          <form className="autorizacion-formulario" onSubmit={manejarEliminarVenta}>
            <p className="texto-secundario">
              Para eliminar la venta #{ventaEliminando.id}, captura las credenciales de un administrador.
              Al confirmar, se borrará la venta y se restaurará el stock de sus lotes.
            </p>

            <div className="campo-formulario">
              <label htmlFor="admin-usuario">Usuario administrador</label>
              <input
                id="admin-usuario"
                type="text"
                value={autorizacionAdmin.adminUsuario}
                onChange={(event) => setAutorizacionAdmin({
                  ...autorizacionAdmin,
                  adminUsuario: event.target.value,
                })}
                required
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="admin-password">Contraseña de administrador</label>
              <input
                id="admin-password"
                type="password"
                value={autorizacionAdmin.adminPassword}
                onChange={(event) => setAutorizacionAdmin({
                  ...autorizacionAdmin,
                  adminPassword: event.target.value,
                })}
                required
              />
            </div>

            <div className="acciones-formulario">
              <button
                className="boton boton--secundario"
                type="button"
                onClick={cerrarEliminarVenta}
                disabled={cargandoEliminar}
              >
                Cancelar
              </button>
              <button className="boton boton--peligro" type="submit" disabled={cargandoEliminar}>
                {cargandoEliminar ? 'Eliminando...' : 'Eliminar venta'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  )
}

export default Ventas
