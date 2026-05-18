function FiltrosClientes({ filtros, onChange }) {
  return (
    <div className="filtros-modulo">
      <div className="filtro-grupo">
        <label htmlFor="filtro-nombre">Nombre</label>
        <input
          id="filtro-nombre"
          type="text"
          placeholder="Buscar por nombre..."
          value={filtros.nombre || ''}
          onChange={(e) => onChange({ ...filtros, nombre: e.target.value })}
        />
      </div>

      <div className="filtro-grupo">
        <label htmlFor="filtro-telefono">Teléfono</label>
        <input
          id="filtro-telefono"
          type="text"
          placeholder="Buscar por teléfono..."
          value={filtros.telefono || ''}
          onChange={(e) => onChange({ ...filtros, telefono: e.target.value })}
        />
      </div>
    </div>
  )
}

export default FiltrosClientes
