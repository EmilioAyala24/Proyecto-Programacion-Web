import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import ProtectedRoute from './components/common/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Lotes from './pages/Lotes'
import Medicamentos from './pages/Medicamentos'
import Proveedores from './pages/Proveedores'
import Ventas from './pages/Ventas'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/medicamentos" element={<Medicamentos />} />
            <Route path="/lotes" element={<Lotes />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/ventas" element={<Ventas />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
