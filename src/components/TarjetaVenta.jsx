function TarjetaVenta() {
  return (
    <article className="tarjeta tarjeta--venta">
      <h2 className="tarjeta__titulo">Datos de la venta</h2>
      <div className="venta__grid">
        <div className="venta__campo">
          <span className="venta__etiqueta">Número de venta</span>
          <span className="venta__valor mono"> #V-00341</span>
        </div>
        <div className="venta__campo">
          <span className="venta__etiqueta">Fecha de venta: </span>
          <span className="venta__valor mono">10 Abril 2026</span>
        </div>
        <div className="venta__campo">
          <span className="venta__etiqueta">Atendido por: </span>
          <span className="venta__valor">Cajero</span>
        </div>
        <div className="venta__campo">
          <span className="venta__etiqueta">Sucursal: </span>
          <span className="venta__valor">Villa de Álvarez</span>
        </div>
      </div>
    </article>
  )
}

export default TarjetaVenta