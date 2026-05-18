import { useEffect, useMemo, useState } from 'react'
import AddButton from '../components/common/AddButton'
import Modal from '../components/common/Modal'
import FiltrosProveedores from '../components/filtros/FiltrosProveedores'
import ProveedorForm from '../components/proveedores/ProveedorForm'
import ProveedoresTable from '../components/proveedores/ProveedoresTable'
import { crearProveedor, obtenerProveedores } from '../services/proveedoresService'

function Proveedores() {
  const [proveedores, setProveedores] = useState([])
  const [filtros, setFiltros] = useState({
    nombre: '',
    correo: '',
  })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    obtenerProveedores()
      .then(setProveedores)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  const proveedoresFiltrados = useMemo(() => {
    return proveedores.filter((proveedor) => {
      const coincideNombre =
        !filtros.nombre ||
        proveedor.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())

      const coincideCorreo =
        !filtros.correo ||
        (proveedor.correo && proveedor.correo.toLowerCase().includes(filtros.correo.toLowerCase()))

      return coincideNombre && coincideCorreo
    })
  }, [filtros, proveedores])

  const manejarCrearProveedor = async (nuevoProveedor) => {
    try {
      const proveedorCreado = await crearProveedor(nuevoProveedor)
      setProveedores((actuales) => [proveedorCreado, ...actuales])
      setError('')
      setModalAbierto(false)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="proveedores-pagina">
      <div className="encabezado-pagina">
        <span className="encabezado-pagina__etiqueta">Modulo de proveedores</span>
        <h1>Proveedores</h1>
        <p>
          Consulta proveedores registrados y agrega nuevos contactos para compras de inventario.
        </p>
      </div>

      <div className="proveedores-resumen">
        <article className="indicador">
          <span>Total</span>
          <strong>{proveedores.length}</strong>
          <small>Proveedores cargados</small>
        </article>
        <article className="indicador">
          <span>Activos</span>
          <strong>{proveedores.filter((proveedor) => proveedor.estado === 'Activo').length}</strong>
          <small>Disponibles para compra</small>
        </article>
      </div>

      <div className="proveedores-panel">
        <div className="proveedores-panel__encabezado">
          <div>
            <h2>Listado</h2>
            <p>Filtra por nombre o correo electrónico.</p>
          </div>
          <AddButton
            onClick={() => setModalAbierto(true)}
            title="Agregar nuevo proveedor"
          />
        </div>

        <FiltrosProveedores filtros={filtros} onChange={setFiltros} />

        {error && <div className="alerta-error">{error}</div>}
        {cargando ? (
          <p className="texto-secundario">Cargando proveedores...</p>
        ) : (
          <ProveedoresTable proveedores={proveedoresFiltrados} />
        )}
      </div>

      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Agregar nuevo proveedor"
      >
        <ProveedorForm onCrearProveedor={manejarCrearProveedor} />
      </Modal>
    </section>
  )
}

export default Proveedores
