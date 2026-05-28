import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { obtenerRutaInicialPorRol } from '../../utils/permisos'
import {
  LIMITES,
  obtenerSeguridadPassword,
  sanitizarUsuario,
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
  const [mostrarPassword, setMostrarPassword] = useState(false)
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
      [name]: name === 'usuario' ? sanitizarUsuario(value) : value.slice(0, 100),
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

  const manejarEnvio = async (event) => {
    event.preventDefault()

    if (!validarFormulario()) {
      return
    }

    try {
      const sesion = await iniciarSesion(formulario)
      navigate(obtenerRutaInicialPorRol(sesion.rol), { replace: true })
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
          maxLength={LIMITES.usuario}
        />
        {errores.usuario && <span className="mensaje-error">{errores.usuario}</span>}
      </div>

      <div className="campo-formulario">
        <label htmlFor="password">Contraseña</label>
        <div className="campo-password">
          <input
            id="password"
            name="password"
            type={mostrarPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={formulario.password}
            onChange={manejarCambio}
            maxLength={100}
          />
          <button
            aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="campo-password__toggle"
            onClick={() => setMostrarPassword((actual) => !actual)}
            type="button"
          >
            {mostrarPassword ? (
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.9 4.4A10.8 10.8 0 0 1 12 4c5 0 8.5 4.2 10 8a14.7 14.7 0 0 1-3.1 4.6" />
                <path d="M6.6 6.6A14.8 14.8 0 0 0 2 12c1.5 3.8 5 8 10 8 1.6 0 3.1-.4 4.4-1.2" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
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
    </form>
  )
}

export default LoginForm
