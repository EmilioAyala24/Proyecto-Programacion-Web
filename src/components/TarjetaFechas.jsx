function TarjetaFechas() {
  return (
    <article className="tarjeta tarjeta--fechas">
      <h2 className="tarjeta__titulo">Fechas de control</h2>
      <div className="fechas__lista">
        <div className="fecha__elemento">
          <div className="fecha__icono">🏭</div>
          <div className="fecha__info">
            <span className="fecha__etiqueta">Fecha de fabricación</span>
            <span className="fecha__valor mono">Marzo 2024</span>
          </div>
        </div>
        <div className="fecha__elemento fecha__elemento--destacado">
          <div className="fecha__icono">📅</div>
          <div className="fecha__info">
            <span className="fecha__etiqueta">Fecha de caducidad</span>
            <span className="fecha__valor fecha__valor--caducidad mono">Marzo 2027</span>
          </div>
        </div>
        <div className="fecha__elemento">
          <div className="fecha__icono">🛍️</div>
          <div className="fecha__info">
            <span className="fecha__etiqueta">Fecha de compra</span>
            <span className="fecha__valor mono">10 Abril 2026</span>
          </div>
        </div>
      </div>
      <div className="vida-util">
        <div className="vida-util__encabezado">
          <span>Tiempo de vida restante</span>
          <span className="mono vida-util__porcentaje">~94%</span>
        </div>
        <div className="vida-util__barra">
          <div className="vida-util__relleno" style={{ width: '94%' }}></div>
        </div>
        <p className="vida-util__nota">Aproximadamente 35 meses restantes</p>
      </div>
    </article>
  )
}

export default TarjetaFechas