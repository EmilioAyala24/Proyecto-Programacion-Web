import { Navigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'
import { useAuth } from '../hooks/useAuth'
import { obtenerRutaInicialPorRol } from '../utils/permisos'

function Login() {
  const { estaAutenticado, usuario } = useAuth()

  if (estaAutenticado) {
    return <Navigate to={obtenerRutaInicialPorRol(usuario?.rol)} replace />
  }

  return (
    <main className="login-pagina">
      <section className="login-panel">
        <div className="login-panel__presentacion">
          <span className="login-panel__marca">Farmacia Inclusiva</span>
          <h1>Acceso al sistema</h1>
          <p>
            Ingresa con una cuenta autorizada para consultar el panel de administración.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  )
}

export default Login
