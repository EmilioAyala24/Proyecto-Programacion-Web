function MedicamentosTable({ medicamentos }) {
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MedicamentosTable
