import { useEffect, useMemo, useState } from 'react'
import AddButton from '../components/common/AddButton'
import Modal from '../components/common/Modal'
import FiltrosClientes from '../components/filtros/FiltrosClientes'
import ClienteForm from '../components/clientes/ClienteForm'
import ClientesTable from '../components/clientes/ClientesTable'
import { crearCliente, eliminarCliente, obtenerClientes } from '../services/clientesService'

function Clientes() {
  const [clientes, setClientes] = useState([])
  const [filtros, setFiltros] = useState({
    nombre: '',
    telefono: '',
  })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    obtenerClientes()
      .then(setClientes)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cliente) => {
      const coincideNombre =
        !filtros.nombre ||
        [cliente.nombre, cliente.apPat, cliente.apMat]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(filtros.nombre.toLowerCase())

      const coincideTelefono =
        !filtros.telefono ||
        (cliente.telefono && cliente.telefono.includes(filtros.telefono))

      return coincideNombre && coincideTelefono
    })
  }, [filtros, clientes])

  const manejarCrearCliente = async (nuevoCliente) => {
    try {
      const clienteCreado = await crearCliente(nuevoCliente)
      setClientes((actuales) => [clienteCreado, ...actuales])
      setError('')
      setModalAbierto(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const manejarEliminarCliente = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      return
    }

    try {
      await eliminarCliente(id)
      setClientes((actuales) => actuales.filter((cliente) => cliente.id !== id))
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="clientes-pagina">
      <div className="encabezado-pagina">
        <span className="encabezado-pagina__etiqueta">Módulo de clientes</span>
        <h1>Clientes</h1>
        <p>Gestiona el registro de clientes y mantén su información actualizada.</p>
      </div>

      <div className="modulo-resumen">
        <article className="indicador">
          <span>Total</span>
          <strong>{clientes.length}</strong>
          <small>Clientes registrados</small>
        </article>
        <article className="indicador">
          <span>Nuevos</span>
          <strong>
            {
              clientes.filter((cliente) => {
                const fecha = new Date(cliente.fechaRegistro)
                const hoy = new Date()
                const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000)
                return fecha > hace7Dias
              }).length
            }
          </strong>
          <small>Últimos 7 días</small>
        </article>
      </div>

      <div className="modulo-panel">
        <div className="modulo-panel__encabezado">
          <div>
            <h2>Listado de clientes</h2>
            <p>Filtra por nombre o teléfono.</p>
          </div>
          <AddButton
            onClick={() => setModalAbierto(true)}
            title="Agregar nuevo cliente"
          />
        </div>

        <FiltrosClientes filtros={filtros} onChange={setFiltros} />

        {error && <div className="alerta-error">{error}</div>}
        {cargando ? (
          <p className="texto-secundario">Cargando clientes...</p>
        ) : (
          <ClientesTable clientes={clientesFiltrados} onEliminar={manejarEliminarCliente} />
        )}
      </div>

      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Registrar nuevo cliente"
      >
        <ClienteForm onCrearCliente={manejarCrearCliente} />
      </Modal>
    </section>
  )
}

export default Clientes
