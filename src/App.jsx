import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import ProtectedRoute from './components/common/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import LlamaGabriel from './pages/LlamaGabriel'
import Login from './pages/Login'
import ModuloPendiente from './pages/ModuloPendiente'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/medicamentos" element={<ModuloPendiente titulo="Medicamentos" />} />
            <Route path="/lotes" element={<ModuloPendiente titulo="Lotes" />} />
            <Route path="/proveedores" element={<ModuloPendiente titulo="Proveedores" />} />
            <Route path="/gabriel" element={<LlamaGabriel />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
