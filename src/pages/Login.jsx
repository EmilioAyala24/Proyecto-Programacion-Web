import { Navigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'
import { useAuth } from '../hooks/useAuth'

function Login() {
  const { estaAutenticado } = useAuth()

  if (estaAutenticado) {
    return <Navigate to="/dashboard" replace />
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
