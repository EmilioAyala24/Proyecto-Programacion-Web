function TarjetaMedicamento() {
  return (
    <article className="tarjeta tarjeta--medicamento">
      <div className="tarjeta__encabezado">
        <span className="tarjeta__etiqueta">Medicamento</span>
        <span className="tarjeta__id">ID Lote: <span className="mono">#L-2024-0892</span></span>
      </div>
      <h1 className="medicamento__nombre">Paracetamol</h1>
      <p className="medicamento__subtitulo">Tabletas · 500 mg · 20 tabletas</p>
      <div className="medicamento__grid">
        <div className="medicamento__campo">
          <span className="medicamento__campo-etiqueta">Presentación</span>
          <span className="medicamento__campo-valor">Tableta</span>
        </div>
        <div className="medicamento__campo">
          <span className="medicamento__campo-etiqueta">Concentración</span>
          <span className="medicamento__campo-valor">500 mg</span>
        </div>
        <div className="medicamento__campo">
          <span className="medicamento__campo-etiqueta">Requiere receta</span>
          <span className="medicamento__campo-valor">No</span>
        </div>
        <div className="medicamento__campo">
          <span className="medicamento__campo-etiqueta">Contenido</span>
          <span className="medicamento__campo-valor">20 tabletas</span>
        </div>
      </div>
    </article>
  )
}

export default TarjetaMedicamento