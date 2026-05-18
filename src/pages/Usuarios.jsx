import { useEffect, useMemo, useState } from 'react'
import AddButton from '../components/common/AddButton'
import Modal from '../components/common/Modal'
import FiltrosUsuarios from '../components/filtros/FiltrosUsuarios'
import UsuarioForm from '../components/usuarios/UsuarioForm'
import UsuariosTable from '../components/usuarios/UsuariosTable'
import { crearUsuario, eliminarUsuario, obtenerUsuarios } from '../services/usuariosService'

function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [filtros, setFiltros] = useState({
    usuario: '',
    rol: '',
  })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    obtenerUsuarios()
      .then(setUsuarios)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const coincideUsuario =
        !filtros.usuario ||
        usuario.usuario.toLowerCase().includes(filtros.usuario.toLowerCase())

      const coincideRol = !filtros.rol || usuario.rol === filtros.rol

      return coincideUsuario && coincideRol
    })
  }, [filtros, usuarios])

  const manejarCrearUsuario = async (nuevoUsuario) => {
    try {
      const usuarioCreado = await crearUsuario(nuevoUsuario)
      setUsuarios((actuales) => [usuarioCreado, ...actuales])
      setError('')
      setModalAbierto(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const manejarEliminarUsuario = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return
    }

    try {
      await eliminarUsuario(id)
      setUsuarios((actuales) => actuales.filter((usuario) => usuario.id !== id))
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="usuarios-pagina">
      <div className="encabezado-pagina">
        <span className="encabezado-pagina__etiqueta">Módulo de usuarios</span>
        <h1>Usuarios del Sistema</h1>
        <p>Gestiona los usuarios y sus roles en el sistema de farmacia.</p>
      </div>

      <div className="modulo-resumen">
        <article className="indicador">
          <span>Total</span>
          <strong>{usuarios.length}</strong>
          <small>Usuarios registrados</small>
        </article>
        <article className="indicador">
          <span>Administradores</span>
          <strong>{usuarios.filter((u) => u.rol === 'admin').length}</strong>
          <small>Con permisos totales</small>
        </article>
        <article className="indicador">
          <span>Vendedores</span>
          <strong>{usuarios.filter((u) => u.rol === 'vendedor').length}</strong>
          <small>En el sistema</small>
        </article>
      </div>

      <div className="modulo-panel">
        <div className="modulo-panel__encabezado">
          <div>
            <h2>Listado de usuarios</h2>
            <p>Filtra por nombre de usuario o rol.</p>
          </div>
          <AddButton
            onClick={() => setModalAbierto(true)}
            title="Crear nuevo usuario"
          />
        </div>

        <FiltrosUsuarios filtros={filtros} onChange={setFiltros} />

        {error && <div className="alerta-error">{error}</div>}
        {cargando ? (
          <p className="texto-secundario">Cargando usuarios...</p>
        ) : (
          <UsuariosTable usuarios={usuariosFiltrados} onEliminar={manejarEliminarUsuario} />
        )}
      </div>

      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Crear nuevo usuario"
      >
        <UsuarioForm onCrearUsuario={manejarCrearUsuario} />
      </Modal>
    </section>
  )
}

export default Usuarios
