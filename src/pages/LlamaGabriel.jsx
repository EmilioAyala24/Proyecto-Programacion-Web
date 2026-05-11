import { Link } from 'react-router-dom'

function LlamaGabriel() {
  return (
    <section className="llama-gabriel">
      <div className="llama-gabriel__contenido">
        <span className="encabezado-pagina__etiqueta">Mascota del proyecto</span>
        <h1>Gabriel</h1>
        <p>
          Una llama tranquila y observadora que acompana el panel mientras los
          modulos principales terminan de integrarse.
        </p>
        <Link className="boton boton--primario" to="/dashboard">
          Volver al dashboard
        </Link>
      </div>

      <div className="llama-gabriel__escena" aria-label="Llama llamada Gabriel" role="img">
        <div className="llama">
          <span className="llama__oreja llama__oreja--izquierda" />
          <span className="llama__oreja llama__oreja--derecha" />
          <span className="llama__copete" />
          <span className="llama__cabeza">
            <span className="llama__ojo llama__ojo--izquierdo" />
            <span className="llama__ojo llama__ojo--derecho" />
            <span className="llama__hocico">
              <span />
            </span>
          </span>
          <span className="llama__cuello" />
          <span className="llama__bufanda" />
          <span className="llama__cuerpo" />
          <span className="llama__pata llama__pata--uno" />
          <span className="llama__pata llama__pata--dos" />
          <span className="llama__pata llama__pata--tres" />
          <span className="llama__pata llama__pata--cuatro" />
        </div>
        <strong>Gabriel</strong>
      </div>
    </section>
  )
}

export default LlamaGabriel
