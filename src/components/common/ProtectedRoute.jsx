import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { obtenerRutaInicialPorRol, puedeAcceder } from '../../utils/permisos'

function ProtectedRoute() {
  const { estaAutenticado, usuario } = useAuth()
  const location = useLocation()

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />
  }

  if (!puedeAcceder(usuario?.rol, location.pathname)) {
    return <Navigate to={obtenerRutaInicialPorRol(usuario?.rol)} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
