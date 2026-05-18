const clasesEstado = {
  Vigente: 'vigente',
  Proximo: 'proximo',
  Caducado: 'caducado',
}

function formatearFecha(fecha) {
  if (!fecha) {
    return '-'
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${fecha}T00:00:00`))
}

function LotesTable({ lotes, onEditar, onEliminar, onVer }) {
  return (
    <div className="tabla-contenedor">
      <table className="tabla-datos">
        <thead>
          <tr>
            <th>Lote</th>
            <th>Medicamento</th>
            <th>Proveedor</th>
            <th>Stock</th>
            <th>Ingreso</th>
            <th>Caducidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lotes.map((lote) => (
            <tr key={lote.id}>
              <td>
                <strong>{lote.codigo}</strong>
              </td>
              <td>{lote.medicamento}</td>
              <td>{lote.proveedor}</td>
              <td>
                <span className={lote.stockDisponible > 0 ? 'stock stock--ok' : 'stock stock--agotado'}>
                  {lote.stockDisponible}
                </span>
              </td>
              <td>{formatearFecha(lote.fechaIngreso)}</td>
              <td>{formatearFecha(lote.fechaCaducidad)}</td>
              <td>
                <span className={`estado estado--${clasesEstado[lote.estado]}`}>
                  {lote.estado === 'Proximo' ? 'Proximo a caducar' : lote.estado}
                </span>
              </td>
              <td>
                <div className="acciones-tabla">
                  <button className="boton-accion" type="button" onClick={() => onVer(lote)}>
                    Ver
                  </button>
                  <button className="boton-accion" type="button" onClick={() => onEditar(lote)}>
                    Editar
                  </button>
                  <button
                    className="boton-accion boton-accion--eliminar"
                    type="button"
                    onClick={() => onEliminar(lote.id)}
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

export default LotesTable
