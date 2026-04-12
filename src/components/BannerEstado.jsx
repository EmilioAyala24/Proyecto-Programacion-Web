function BannerEstado() {
  return (
    <section className="banner-estado banner-estado--vigente" aria-label="Estado de vigencia del medicamento">
      <div className="banner-estado__indicador"></div>
      <div className="banner-estado__contenido">
        <span className="banner-estado__etiqueta">Estado</span>
        <strong className="banner-estado__valor">VIGENTE</strong>
      </div>
      <div className="banner-estado__icono">✔</div>
    </section>
  )
}

export default BannerEstado