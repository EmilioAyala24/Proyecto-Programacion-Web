function ProveedoresTable({ proveedores, onEditar, onEliminar, onVer }) {
  return (
    <div className="tabla-contenedor">
      <table className="tabla-datos">
        <thead>
          <tr>
            <th>Proveedor</th>
            <th>Telefono</th>
            <th>Correo</th>
            <th>Direccion</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((proveedor) => (
            <tr key={proveedor.id}>
              <td>
                <strong>{proveedor.nombre}</strong>
              </td>
              <td>{proveedor.telefono}</td>
              <td>{proveedor.correo}</td>
              <td>{proveedor.direccion}</td>
              <td>
                <span className={`estado estado--${proveedor.estado.toLowerCase()}`}>
                  {proveedor.estado}
                </span>
              </td>
              <td>
                <div className="acciones-tabla">
                  <button className="boton-accion" type="button" onClick={() => onVer(proveedor)}>
                    Ver
                  </button>
                  <button className="boton-accion" type="button" onClick={() => onEditar(proveedor)}>
                    Editar
                  </button>
                  <button
                    className="boton-accion boton-accion--eliminar"
                    type="button"
                    onClick={() => onEliminar(proveedor.id)}
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

export default ProveedoresTable
