import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { obtenerDetalleQR } from '../services/qrsService'

function formatearFecha(fecha) {
  if (!fecha) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${fecha}T00:00:00`))
}

function QRMedicamento() {
  const { token } = useParams()
  const [detalle, setDetalle] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [leyendo, setLeyendo] = useState(false)
  const tokenCargadoRef = useRef('')

  useEffect(() => {
    if (!token || tokenCargadoRef.current === token) {
      return
    }

    tokenCargadoRef.current = token

    obtenerDetalleQR(token)
      .then(setDetalle)
      .catch((err) => {
        tokenCargadoRef.current = ''
        setError(err.message)
      })
      .finally(() => setCargando(false))
  }, [token])

  const textoAudio = useMemo(() => {
    if (!detalle) {
      return ''
    }

    const receta = detalle.medicamento.requiereReceta
      ? 'Este medicamento requiere receta.'
      : 'Este medicamento no requiere receta.'

    return [
      `Medicamento: ${detalle.medicamento.nombre}.`,
      `Presentación: ${detalle.medicamento.presentacion}.`,
      `Concentración: ${detalle.medicamento.concentracion}.`,
      detalle.medicamento.contenido ? `Contenido: ${detalle.medicamento.contenido}.` : '',
      `Lote: ${detalle.lote.numero}.`,
      `Proveedor: ${detalle.lote.proveedor}.`,
      `Fecha de caducidad: ${formatearFecha(detalle.lote.fechaCaducidad)}.`,
      `Stock disponible: ${detalle.lote.stock}.`,
      receta,
    ].filter(Boolean).join(' ')
  }, [detalle])

  const reproducirAudio = () => {
    if (!textoAudio || !('speechSynthesis' in window)) {
      setError('Tu navegador no tiene reproducción de voz disponible.')
      return
    }

    window.speechSynthesis.cancel()
    const lectura = new SpeechSynthesisUtterance(textoAudio)
    lectura.lang = 'es-MX'
    lectura.rate = 0.95
    lectura.onend = () => setLeyendo(false)
    lectura.onerror = () => setLeyendo(false)
    setLeyendo(true)
    window.speechSynthesis.speak(lectura)
  }

  const detenerAudio = () => {
    window.speechSynthesis.cancel()
    setLeyendo(false)
  }

  return (
    <main className="qr-publico">
      <section className="qr-publico__tarjeta">
        <span className="encabezado-pagina__etiqueta">Farmacia Inclusiva</span>

        {cargando && <p className="texto-secundario">Cargando información del QR...</p>}
        {error && <div className="alerta-error">{error}</div>}

        {detalle && (
          <>
            <h1>{detalle.medicamento.nombre}</h1>
            <p>
              {detalle.medicamento.presentacion} / {detalle.medicamento.concentracion}
              {detalle.medicamento.contenido ? ` / ${detalle.medicamento.contenido}` : ''}
            </p>

            <div className="qr-publico__acciones">
              <button className="boton boton--primario" type="button" onClick={reproducirAudio}>
                {leyendo ? 'Reproduciendo...' : 'Reproducir audio'}
              </button>
              {leyendo && (
                <button className="boton boton--secundario" type="button" onClick={detenerAudio}>
                  Detener
                </button>
              )}
            </div>

            <div className="detalle-medicamento-grid">
              <div>
                <span>Lote</span>
                <strong>{detalle.lote.numero}</strong>
              </div>
              <div>
                <span>Proveedor</span>
                <strong>{detalle.lote.proveedor}</strong>
              </div>
              <div>
                <span>Caducidad</span>
                <strong>{formatearFecha(detalle.lote.fechaCaducidad)}</strong>
              </div>
              <div>
                <span>Stock</span>
                <strong>{detalle.lote.stock}</strong>
              </div>
              <div>
                <span>Precio</span>
                <strong>${Number(detalle.lote.precioVenta || 0).toFixed(2)}</strong>
              </div>
              <div>
                <span>Receta</span>
                <strong>{detalle.medicamento.requiereReceta ? 'Sí requiere' : 'No requiere'}</strong>
              </div>
            </div>

            <p className="texto-secundario">
              Escaneos registrados: {detalle.contadorEscaneos}
            </p>
          </>
        )}
      </section>
    </main>
  )
}

export default QRMedicamento
