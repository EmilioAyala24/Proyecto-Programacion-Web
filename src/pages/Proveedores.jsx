import { useEffect, useMemo, useState } from 'react'
import ProveedorForm from '../components/proveedores/ProveedorForm'
import ProveedoresTable from '../components/proveedores/ProveedoresTable'
import { crearProveedor, obtenerProveedores } from '../services/proveedoresService'

function Proveedores() {
  const [proveedores, setProveedores] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    obtenerProveedores()
      .then(setProveedores)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  const proveedoresFiltrados = useMemo(() => {
    const valor = busqueda.trim().toLowerCase()

    if (!valor) {
      return proveedores
    }

    return proveedores.filter((proveedor) =>
      [proveedor.nombre, proveedor.telefono, proveedor.correo, proveedor.direccion]
        .join(' ')
        .toLowerCase()
        .includes(valor),
    )
  }, [busqueda, proveedores])

  const manejarCrearProveedor = async (nuevoProveedor) => {
    try {
      const proveedorCreado = await crearProveedor(nuevoProveedor)
      setProveedores((actuales) => [proveedorCreado, ...actuales])
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
            <p>Busca por nombre, correo, telefono o direccion.</p>
          </div>
          <input
            aria-label="Buscar proveedor"
            className="buscador"
            placeholder="Buscar proveedor"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </div>

        {error && <div className="alerta-error">{error}</div>}
        {cargando ? (
          <p className="texto-secundario">Cargando proveedores...</p>
        ) : (
          <ProveedoresTable proveedores={proveedoresFiltrados} />
        )}
      </div>

      <div className="proveedores-panel">
        <div className="proveedores-panel__encabezado">
          <div>
            <h2>Registrar proveedor</h2>
            <p>Los datos se guardan temporalmente en frontend hasta conectar la API real.</p>
          </div>
        </div>
        <ProveedorForm onCrearProveedor={manejarCrearProveedor} />
      </div>
    </section>
  )
}

export default Proveedores
