function MedicamentosTable({ medicamentos, onEditar, onEliminar, onVer }) {
  const formatoPrecio = (valor) => Number(valor || 0).toFixed(2)

  return (
    <div className="tabla-contenedor">
      <table className="tabla-datos">
        <thead>
          <tr>
            <th>Medicamento</th>
            <th>Presentacion</th>
            <th>Concentracion</th>
            <th>Contenido</th>
            <th>Receta</th>
            <th>Stock</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medicamentos.map((medicamento) => (
            <tr key={medicamento.id}>
              <td>
                <strong>{medicamento.nombre}</strong>
              </td>
              <td>{medicamento.presentacion}</td>
              <td>{medicamento.concentracion}</td>
              <td>{medicamento.contenido}</td>
              <td>{medicamento.requiereReceta ? 'Si' : 'No'}</td>
              <td>
                <span className={medicamento.stockDisponible > 0 ? 'stock stock--ok' : 'stock stock--agotado'}>
                  {medicamento.stockDisponible}
                </span>
              </td>
              <td>${formatoPrecio(medicamento.precioUnitario)}</td>
              <td>
                <div className="acciones-tabla">
                  <button className="boton-accion" type="button" onClick={() => onVer(medicamento)}>
                    Ver
                  </button>
                  <button className="boton-accion" type="button" onClick={() => onEditar(medicamento)}>
                    Editar
                  </button>
                  <button
                    className="boton-accion boton-accion--eliminar"
                    type="button"
                    onClick={() => onEliminar(medicamento.id)}
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

export default MedicamentosTable
