function ProveedoresTable({ proveedores }) {
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProveedoresTable
