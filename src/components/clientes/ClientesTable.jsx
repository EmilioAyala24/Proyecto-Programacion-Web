function ClientesTable({ clientes, onEditar, onEliminar, onVer }) {
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
                <div className="acciones-tabla">
                  <button className="boton-accion" type="button" onClick={() => onVer(cliente)}>
                    Ver
                  </button>
                  <button className="boton-accion" type="button" onClick={() => onEditar(cliente)}>
                    Editar
                  </button>
                  <button
                    className="boton-accion boton-accion--eliminar"
                    onClick={() => onEliminar(cliente.id)}
                    title="Eliminar"
                    type="button"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ClientesTable
