import { useEffect, useMemo, useState } from 'react'
import AddButton from '../components/common/AddButton'
import DetalleRegistro from '../components/common/DetalleRegistro'
import Modal from '../components/common/Modal'
import Paginacion from '../components/common/Paginacion'
import FiltrosProveedores from '../components/filtros/FiltrosProveedores'
import ProveedorForm from '../components/proveedores/ProveedorForm'
import ProveedoresTable from '../components/proveedores/ProveedoresTable'
import {
  actualizarProveedor,
  crearProveedor,
  eliminarProveedor,
  obtenerProveedores,
} from '../services/proveedoresService'

function Proveedores() {
  const [proveedores, setProveedores] = useState([])
  const [filtros, setFiltros] = useState({
    nombre: '',
    correo: '',
  })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [proveedorEditando, setProveedorEditando] = useState(null)
  const [proveedorViendo, setProveedorViendo] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const registrosPorPagina = 8

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

  const totalPaginas = Math.max(1, Math.ceil(proveedoresFiltrados.length / registrosPorPagina))
  const proveedoresPaginados = proveedoresFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina,
  )

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

  const manejarActualizarProveedor = async (datos) => {
    try {
      const proveedorActualizado = await actualizarProveedor(proveedorEditando.id, datos)
      setProveedores((actuales) =>
        actuales.map((proveedor) =>
          proveedor.id === proveedorActualizado.id ? proveedorActualizado : proveedor,
        ),
      )
      setProveedorEditando(null)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  const manejarEliminarProveedor = async (id) => {
    if (!window.confirm('Estas seguro de que deseas eliminar este proveedor?')) {
      return
    }

    try {
      await eliminarProveedor(id)
      setProveedores((actuales) => actuales.filter((proveedor) => proveedor.id !== id))
      setError('')
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

        <FiltrosProveedores
          filtros={filtros}
          onChange={(nuevosFiltros) => {
            setFiltros(nuevosFiltros)
            setPaginaActual(1)
          }}
        />

        {error && <div className="alerta-error">{error}</div>}
        {cargando ? (
          <p className="texto-secundario">Cargando proveedores...</p>
        ) : (
          <ProveedoresTable
            proveedores={proveedoresPaginados}
            onEditar={setProveedorEditando}
            onEliminar={manejarEliminarProveedor}
            onVer={setProveedorViendo}
          />
        )}
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalRegistros={proveedoresFiltrados.length}
          onChange={setPaginaActual}
        />
      </div>

      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Agregar nuevo proveedor"
      >
        <ProveedorForm onCrearProveedor={manejarCrearProveedor} />
      </Modal>

      <Modal
        isOpen={Boolean(proveedorEditando)}
        onClose={() => setProveedorEditando(null)}
        title="Editar proveedor"
      >
        <ProveedorForm
          proveedorInicial={proveedorEditando}
          onGuardar={manejarActualizarProveedor}
        />
      </Modal>

      <Modal
        isOpen={Boolean(proveedorViendo)}
        onClose={() => setProveedorViendo(null)}
        title="Detalle del proveedor"
      >
        {proveedorViendo && (
          <DetalleRegistro
            campos={[
              { etiqueta: 'Nombre', valor: proveedorViendo.nombre },
              { etiqueta: 'Teléfono', valor: proveedorViendo.telefono },
              { etiqueta: 'Correo', valor: proveedorViendo.correo },
              { etiqueta: 'Dirección', valor: proveedorViendo.direccion },
              { etiqueta: 'Estado', valor: proveedorViendo.estado },
            ]}
          />
        )}
      </Modal>
    </section>
  )
}

export default Proveedores
