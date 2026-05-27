import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import ProtectedRoute from './components/common/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import Clientes from './pages/Clientes'
import Dashboard from './pages/Dashboard'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import Lotes from './pages/Lotes'
import MedicamentoDetalle from './pages/MedicamentoDetalle'
import Medicamentos from './pages/Medicamentos'
import Proveedores from './pages/Proveedores'
import QRMedicamento from './pages/QRMedicamento'
import Reportes from './pages/Reportes'
import TicketPublico from './pages/TicketPublico'
import Trazabilidad from './pages/Trazabilidad'
import Usuarios from './pages/Usuarios'
import Ventas from './pages/Ventas'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/qr/:token" element={<QRMedicamento />} />
        <Route path="/ticket/:id" element={<TicketPublico />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/medicamentos" element={<Medicamentos />} />
            <Route path="/medicamentos/:id" element={<MedicamentoDetalle />} />
            <Route path="/lotes" element={<Lotes />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/trazabilidad" element={<Trazabilidad />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/reportes" element={<Reportes />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
