function FiltrosProveedores({ filtros, onChange }) {
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
        <label htmlFor="filtro-correo">Correo</label>
        <input
          id="filtro-correo"
          type="text"
          placeholder="Buscar por correo..."
          value={filtros.correo || ''}
          onChange={(e) => onChange({ ...filtros, correo: e.target.value })}
        />
      </div>
    </div>
  )
}

export default FiltrosProveedores
