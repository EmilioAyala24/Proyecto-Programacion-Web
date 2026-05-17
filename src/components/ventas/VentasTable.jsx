function VentasTable({ ventas, cargando, error }) {
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
      <table className="tabla">
        <thead className="tabla__cabecera">
          <tr className="tabla__fila">
            <th className="tabla__celda tabla__celda--encabezado">ID Venta</th>
            <th className="tabla__celda tabla__celda--encabezado">Fecha</th>
            <th className="tabla__celda tabla__celda--encabezado">Usuario</th>
            <th className="tabla__celda tabla__celda--encabezado">Cliente</th>
            <th className="tabla__celda tabla__celda--encabezado">Método de Pago</th>
            <th className="tabla__celda tabla__celda--encabezado">Medicamentos</th>
            <th className="tabla__celda tabla__celda--encabezado">Total</th>
          </tr>
        </thead>
        <tbody className="tabla__cuerpo">
          {ventas.map((venta) => (
            <tr key={venta.id} className="tabla__fila">
              <td className="tabla__celda">
                <span className="mono">#{venta.id}</span>
              </td>
              <td className="tabla__celda">{venta.fecha}</td>
              <td className="tabla__celda">{venta.usuario}</td>
              <td className="tabla__celda">{venta.cliente}</td>
              <td className="tabla__celda">{venta.metodoPago}</td>
              <td className="tabla__celda">
                <span className="insignia">{venta.cantidad_medicamentos}</span>
              </td>
              <td className="tabla__celda tabla__celda--enfasis">
                ${venta.total.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default VentasTable
