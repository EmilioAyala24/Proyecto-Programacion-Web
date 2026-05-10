import { Link } from 'react-router-dom'

function ModuloPendiente({ titulo }) {
  return (
    <section className="modulo-pendiente">
      <span className="encabezado-pagina__etiqueta">Módulo pendiente</span>
      <h1>{titulo}</h1>
      <p>
        Esta ruta ya está preparada para integrarse, pero el contenido del módulo
        lo trabajará el integrante responsable.
      </p>
      <Link className="boton boton--primario" to="/dashboard">
        Volver al dashboard
      </Link>
    </section>
  )
}

export default ModuloPendiente
