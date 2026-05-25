import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { obtenerModulosPorRol, obtenerNombreRol } from '../utils/permisos'

function AppLayout() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const modulos = obtenerModulosPorRol(usuario?.rol)

  const manejarCerrarSesion = () => {
    cerrarSesion()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="barra-lateral">
        <div className="barra-lateral__marca">
          <span className="barra-lateral__logo" aria-hidden="true">+</span>
          <div>
            <strong>Farmacia Inclusiva</strong>
            <span>Panel administrativo</span>
          </div>
        </div>

        <nav className="navegacion-principal" aria-label="Navegacion principal">
          {modulos.map((modulo) => (
            <NavLink key={modulo.ruta} to={modulo.ruta}>
              {modulo.etiqueta}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="contenido-app">
        <header className="barra-superior">
          <div>
            <span className="barra-superior__etiqueta">Sesion activa</span>
            <strong>{usuario?.nombre}</strong>
            <span>{obtenerNombreRol(usuario?.rol)}</span>
          </div>
          <button className="boton boton--secundario" onClick={manejarCerrarSesion} type="button">
            Cerrar sesion
          </button>
        </header>

        <main className="contenido-principal">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
