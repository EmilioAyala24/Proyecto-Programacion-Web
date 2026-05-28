import { Link } from 'react-router-dom'

const modulos = [
  {
    titulo: 'Medicamentos',
    descripcion: 'Consulta del catálogo, presentaciones, concentraciones y receta.',
    ruta: '/medicamentos',
  },
  {
    titulo: 'Lotes',
    descripcion: 'Control de stock, fechas de ingreso y alertas de caducidad.',
    ruta: '/lotes',
  },
  {
    titulo: 'Proveedores',
    descripcion: 'Administración de contactos, correo, teléfono y dirección.',
    ruta: '/proveedores',
  },
]

function Dashboard() {
  return (
    <section className="dashboard">
      <div className="encabezado-pagina">
        <span className="encabezado-pagina__etiqueta">Primer avance funcional</span>
        <h1>Panel principal</h1>
        <p>
          Login, validaciones y navegación base listos para conectar los módulos del equipo.
        </p>
      </div>

      <div className="indicadores-grid">
        <article className="indicador">
          <span>Usuarios</span>
          <strong>1</strong>
          <small>Sesión simulada activa</small>
        </article>
        <article className="indicador">
          <span>Validaciones</span>
          <strong>5</strong>
          <small>Reglas de contraseña</small>
        </article>
        <article className="indicador">
          <span>Módulos</span>
          <strong>3</strong>
          <small>Listos para integrar</small>
        </article>
      </div>

      <div className="modulos-grid">
        {modulos.map((modulo) => (
          <article className="modulo-card" key={modulo.titulo}>
            <div>
              <h2>{modulo.titulo}</h2>
              <p>{modulo.descripcion}</p>
            </div>
            <Link to={modulo.ruta}>Abrir módulo</Link>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Dashboard
