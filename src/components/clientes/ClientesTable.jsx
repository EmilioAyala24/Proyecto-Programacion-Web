function ClientesTable({ clientes, onEliminar }) {
  const formatoFecha = (fecha) => {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-CO')
  }

  return (
    <div className="tabla-contenedor">
      <table className="tabla-datos">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido Paterno</th>
            <th>Apellido Materno</th>
            <th>Teléfono</th>
            <th>Fecha de Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>
                <strong>{cliente.nombre}</strong>
              </td>
              <td>{cliente.apPat || '-'}</td>
              <td>{cliente.apMat || '-'}</td>
              <td>{cliente.telefono || '-'}</td>
              <td>{formatoFecha(cliente.fechaRegistro)}</td>
              <td>
                <button
                  className="boton-accion boton-accion--eliminar"
                  onClick={() => onEliminar(cliente.id)}
                  title="Eliminar"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ClientesTable
