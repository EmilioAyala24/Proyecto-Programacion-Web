import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function AppLayout() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  const manejarCerrarSesion = () => {
    cerrarSesion()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="barra-lateral">
        <div className="barra-lateral__marca">
          <span className="barra-lateral__logo" aria-hidden="true">✚</span>
          <div>
            <strong>Farmacia Inclusiva</strong>
            <span>Panel administrativo</span>
          </div>
        </div>

        <nav className="navegacion-principal" aria-label="Navegación principal">
          <NavLink to="/inicio">Inicio</NavLink>
          <NavLink to="/medicamentos">Medicamentos</NavLink>
          <NavLink to="/lotes">Lotes</NavLink>
          <NavLink to="/proveedores">Proveedores</NavLink>
          <NavLink to="/clientes">Clientes</NavLink>
          <NavLink to="/usuarios">Usuarios</NavLink>
          <NavLink to="/ventas">Ventas</NavLink>
        </nav>
      </aside>

      <div className="contenido-app">
        <header className="barra-superior">
          <div>
            <span className="barra-superior__etiqueta">Sesión activa</span>
            <strong>{usuario?.nombre}</strong>
          </div>
          <button className="boton boton--secundario" onClick={manejarCerrarSesion} type="button">
            Cerrar sesión
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
