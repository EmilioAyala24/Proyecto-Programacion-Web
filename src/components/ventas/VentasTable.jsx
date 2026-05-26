function VentasTable({ ventas, cargando, error, onVer, onTicket }) {
  const formatoPrecio = (valor) => Number(valor || 0).toFixed(2)

  if (cargando) {
    return (
      <div className="tabla-contenedor">
        <p className="estado-mensaje">Cargando ventas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="tabla-contenedor">
        <p className="estado-mensaje estado-error">{error}</p>
      </div>
    )
  }

  if (!ventas || ventas.length === 0) {
    return (
      <div className="tabla-contenedor">
        <p className="estado-mensaje">No hay ventas registradas</p>
      </div>
    )
  }

  return (
    <div className="tabla-contenedor">
      <table className="tabla-datos ventas-tabla">
        <thead>
          <tr>
            <th>ID Venta</th>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Cliente</th>
            <th>Metodo de pago</th>
            <th>Cant.</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.id}>
              <td>
                <span className="mono">#{venta.id}</span>
              </td>
              <td>{venta.fecha}</td>
              <td>{venta.usuario}</td>
              <td>{venta.cliente}</td>
              <td>{venta.metodoPago}</td>
              <td>
                <span className="insignia">{venta.cantidad_medicamentos}</span>
              </td>
              <td className="tabla-datos__monto">${formatoPrecio(venta.total)}</td>
              <td>
                <div className="acciones-tabla">
                  <button className="boton-accion" type="button" onClick={() => onVer(venta)}>
                    Ver
                  </button>
                  <button
                    className="boton-accion boton-accion--ticket"
                    type="button"
                    onClick={() => onTicket(venta)}
                  >
                    Ticket
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

export default VentasTable
