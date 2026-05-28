import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { obtenerTicketPublico } from '../services/ventasService'

function formatoPrecio(valor) {
  return Number(valor || 0).toFixed(2)
}

function formatearFecha(fecha) {
  if (!fecha) {
    return 'Sin fecha'
  }

  const [year, month, day] = String(fecha).split('T')[0].split('-')
  return year && month && day ? `${day}-${month}-${year}` : String(fecha)
}

function crearTextoMedicamento(detalle) {
  return [
    `Medicamento ${detalle.medicamento}.`,
    detalle.presentacion ? `Presentación ${detalle.presentacion}.` : '',
    detalle.concentracion ? `Concentración ${detalle.concentracion}.` : '',
    detalle.contenido ? `Contenido ${detalle.contenido}.` : '',
    `Lote ${detalle.numeroLote || 'no disponible'}.`,
    `Fecha de caducidad ${formatearFecha(detalle.fechaCaducidad)}.`,
    `Cantidad comprada ${detalle.cantidad}.`,
    `Precio unitario ${formatoPrecio(detalle.precio_unitario)} pesos.`,
    detalle.requiereReceta ? 'Este medicamento requiere receta.' : 'Este medicamento no requiere receta.',
  ].filter(Boolean).join(' ')
}

function TicketPublico() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [medicamentoAbierto, setMedicamentoAbierto] = useState(null)

  useEffect(() => {
    let activo = true

    obtenerTicketPublico(id)
      .then((datos) => {
        if (!activo) {
          return
        }

        setTicket(datos)
        setMedicamentoAbierto(datos.detalles[0]?.id ?? null)
        setError('')
      })
      .catch((err) => {
        if (activo) {
          setError(err.message)
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false)
        }
      })

    return () => {
      activo = false
    }
  }, [id])

  const resumen = useMemo(() => {
    const total = Number(ticket?.venta?.total || 0)
    const subtotal = total / 1.16
    const iva = total - subtotal

    return { subtotal, iva, total }
  }, [ticket])

  const reproducirAudio = (detalle) => {
    if (!('speechSynthesis' in window)) {
      setError('Tu navegador no permite reproducir audio automático.')
      return
    }

    window.speechSynthesis.cancel()
    const mensaje = new SpeechSynthesisUtterance(crearTextoMedicamento(detalle))
    mensaje.lang = 'es-MX'
    mensaje.rate = 0.95
    window.speechSynthesis.speak(mensaje)
  }

  return (
    <main className="qr-publico ticket-publico">
      <section className="qr-publico__tarjeta ticket-publico__tarjeta">
        <span className="encabezado-pagina__etiqueta">Farmacia Inclusiva</span>
        <h1>Ticket #{id}</h1>

        {cargando && <p>Consultando información del ticket...</p>}
        {error && <div className="alerta-error">{error}</div>}

        {ticket && (
          <>
            <div className="ticket-publico__resumen">
              <div>
                <span>Fecha</span>
                <strong>{ticket.venta.fecha}</strong>
              </div>
              <div>
                <span>Cliente</span>
                <strong>{ticket.venta.cliente}</strong>
              </div>
              <div>
                <span>Método de pago</span>
                <strong>{ticket.venta.metodoPago}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>${formatoPrecio(resumen.total)}</strong>
              </div>
            </div>

            <div className="ticket-publico__totales">
              <span>Subtotal: <strong>${formatoPrecio(resumen.subtotal)}</strong></span>
              <span>IVA 16%: <strong>${formatoPrecio(resumen.iva)}</strong></span>
              <span>Total: <strong>${formatoPrecio(resumen.total)}</strong></span>
            </div>

            <div className="ticket-publico__lista">
              {ticket.detalles.map((detalle) => {
                const abierto = medicamentoAbierto === detalle.id

                return (
                  <article className="ticket-publico__medicamento" key={detalle.id}>
                    <button
                      aria-expanded={abierto}
                      className="ticket-publico__medicamento-btn"
                      onClick={() => setMedicamentoAbierto(abierto ? null : detalle.id)}
                      type="button"
                    >
                      <span>
                        <strong>{detalle.medicamento}</strong>
                        <small>
                          {detalle.presentacion} {detalle.concentracion}
                          {detalle.contenido ? ` / ${detalle.contenido}` : ''}
                        </small>
                        <small>
                          Lote {detalle.numeroLote || 'N/D'} / Cad. {formatearFecha(detalle.fechaCaducidad)}
                        </small>
                      </span>
                      <span>${formatoPrecio(detalle.subtotal)}</span>
                    </button>

                    {abierto && (
                      <div className="ticket-publico__detalle">
                        <button
                          className="boton boton--secundario ticket-publico__audio"
                          onClick={() => reproducirAudio(detalle)}
                          type="button"
                        >
                          Reproducir audio
                        </button>
                        <div>
                          <span>Cantidad</span>
                          <strong>{detalle.cantidad}</strong>
                        </div>
                        <div>
                          <span>Lote</span>
                          <strong>{detalle.numeroLote || 'No disponible'}</strong>
                        </div>
                        <div>
                          <span>Caducidad</span>
                          <strong>{formatearFecha(detalle.fechaCaducidad)}</strong>
                        </div>
                        <div>
                          <span>Precio unitario</span>
                          <strong>${formatoPrecio(detalle.precio_unitario)}</strong>
                        </div>
                        <div>
                          <span>Presentación</span>
                          <strong>{detalle.presentacion || 'No especificada'}</strong>
                        </div>
                        <div>
                          <span>Concentración</span>
                          <strong>{detalle.concentracion || 'No especificada'}</strong>
                        </div>
                        <div>
                          <span>Contenido</span>
                          <strong>{detalle.contenido || 'No especificado'}</strong>
                        </div>
                        <div>
                          <span>Receta</span>
                          <strong>{detalle.requiereReceta ? 'Sí requiere' : 'No requiere'}</strong>
                        </div>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default TicketPublico
