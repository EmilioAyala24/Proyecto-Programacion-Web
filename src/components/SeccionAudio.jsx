function SeccionAudio() {
  const reproducir = () => {
    const texto = "Medicamento: Paracetamol. Presentación: Tableta de 500 miligramos. Contenido: 20 tabletas. Fecha de caducidad: Marzo 2027. Estado: Vigente."
    const voz = new SpeechSynthesisUtterance(texto)
    voz.lang = 'es-MX'
    window.speechSynthesis.speak(voz)
  }

  return (
    <section className="seccion-audio">
      <div className="audio__tarjeta">
        <div className="audio__icono">🔊</div>
        <div className="audio__texto">
          <h2 className="audio__titulo">Reproducir información</h2>
          <p className="audio__descripcion">Escucha los datos del medicamento</p>
        </div>
        <button
          className="boton-audio"
          onClick={reproducir}
          aria-label="Reproducir información del medicamento en voz alta"
          type="button"
        >
          <span className="boton-audio__play">▶</span>
          <span className="boton-audio__etiqueta">Escuchar</span>
        </button>
      </div>
    </section>
  )
}

export default SeccionAudio