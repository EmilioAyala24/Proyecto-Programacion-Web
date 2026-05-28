import './Graficos.css'

function TarjetaMetrica({ titulo, valor, subtitulo, icono, color }) {
  return (
    <div className="tarjeta-metrica" style={{ borderLeftColor: color }}>
      <div className="tarjeta-metrica__contenido">
        <span className="tarjeta-metrica__titulo">{titulo}</span>
        <strong className="tarjeta-metrica__valor">{valor}</strong>
        {subtitulo && <small className="tarjeta-metrica__subtitulo">{subtitulo}</small>}
      </div>
      {icono && <div className="tarjeta-metrica__icono">{icono}</div>}
    </div>
  )
}

export default TarjetaMetrica
