import { useMemo, useState } from 'react'
import { login as loginService, logout as logoutService, obtenerSesion } from '../services/authService'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => obtenerSesion())

  const value = useMemo(() => ({
    usuario,
    estaAutenticado: Boolean(usuario),
    iniciarSesion: (credenciales) => {
      const sesion = loginService(credenciales)
      setUsuario(sesion)
      return sesion
    },
    cerrarSesion: () => {
      logoutService()
      setUsuario(null)
    },
  }), [usuario])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
