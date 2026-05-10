import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  obtenerSeguridadPassword,
  validarPassword,
  validarUsuario,
} from '../../utils/validaciones'

const valoresIniciales = {
  usuario: '',
  password: '',
}

function LoginForm() {
  const [formulario, setFormulario] = useState(valoresIniciales)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()

  const seguridad = useMemo(
    () => obtenerSeguridadPassword(formulario.password),
    [formulario.password],
  )

  const manejarCambio = (event) => {
    const { name, value } = event.target
    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }))
    setErrorGeneral('')
  }

  const validarFormulario = () => {
    const nuevosErrores = {
      usuario: validarUsuario(formulario.usuario),
      password: validarPassword(formulario.password),
    }

    setErrores(nuevosErrores)
    return !nuevosErrores.usuario && !nuevosErrores.password
  }

  const manejarEnvio = (event) => {
    event.preventDefault()

    if (!validarFormulario()) {
      return
    }

    try {
      iniciarSesion(formulario)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrorGeneral(error.message)
    }
  }

  return (
    <form className="login-formulario" onSubmit={manejarEnvio} noValidate>
      <div className="campo-formulario">
        <label htmlFor="usuario">Usuario</label>
        <input
          id="usuario"
          name="usuario"
          autoComplete="username"
          placeholder="admin"
          value={formulario.usuario}
          onChange={manejarCambio}
        />
        {errores.usuario && <span className="mensaje-error">{errores.usuario}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Admin123!"
          value={formulario.password}
          onChange={manejarCambio}
        />
        {errores.password && <span className="mensaje-error">{errores.password}</span>}
      </div>

      <div className={`seguridad-password seguridad-password--${seguridad.clase}`}>
        <div className="seguridad-password__encabezado">
          <span>Seguridad de contraseña</span>
          <strong>{seguridad.nivel}</strong>
        </div>
        <div className="seguridad-password__barra" aria-hidden="true">
          <span style={{ width: `${(seguridad.puntaje / seguridad.reglas.length) * 100}%` }}></span>
        </div>
        <ul className="seguridad-password__reglas">
          {seguridad.reglas.map((regla) => (
            <li className={regla.valida ? 'cumple' : ''} key={regla.id}>
              {regla.texto}
            </li>
          ))}
        </ul>
      </div>

      {errorGeneral && <div className="alerta-error">{errorGeneral}</div>}

      <button className="boton boton--primario" type="submit">
        Iniciar sesión
      </button>

      <p className="login-formulario__ayuda">
        Usuario de prueba: <strong>admin</strong> · Contraseña: <strong>Admin123!</strong>
      </p>
    </form>
  )
}

export default LoginForm
