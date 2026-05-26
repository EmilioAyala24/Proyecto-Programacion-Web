import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { obtenerModulosPorRol, obtenerNombreRol } from '../utils/permisos'

function AppLayout() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(true)
  const modulos = obtenerModulosPorRol(usuario?.rol)

  const manejarCerrarSesion = async () => {
    await cerrarSesion()
    navigate('/login', { replace: true })
  }

  return (
    <div className={`app-shell ${menuAbierto ? 'app-shell--menu-abierto' : 'app-shell--menu-cerrado'}`}>
      {menuAbierto && (
        <button
          className="menu-overlay"
          type="button"
          aria-label="Cerrar menu"
          onClick={() => setMenuAbierto(false)}
        />
      )}

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
            <NavLink
              key={modulo.ruta}
              to={modulo.ruta}
              onClick={() => {
                if (window.innerWidth <= 900) {
                  setMenuAbierto(false)
                }
              }}
            >
              {modulo.etiqueta}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="contenido-app">
        <header className="barra-superior">
          <div className="barra-superior__izquierda">
            <button
              className="boton-menu"
              type="button"
              aria-label={menuAbierto ? 'Ocultar menu' : 'Mostrar menu'}
              aria-expanded={menuAbierto}
              onClick={() => setMenuAbierto((abierto) => !abierto)}
            >
              <span />
              <span />
              <span />
            </button>
            <div>
              <span className="barra-superior__etiqueta">Sesion activa</span>
              <strong>{usuario?.nombre}</strong>
              <span>{obtenerNombreRol(usuario?.rol)}</span>
            </div>
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
