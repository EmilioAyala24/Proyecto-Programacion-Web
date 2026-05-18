import './FiltrosModulo.css'

function FiltrosMedicamentos({ filtros, onChange }) {
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
        <label htmlFor="filtro-receta">Requiere Receta</label>
        <select
          id="filtro-receta"
          value={filtros.receta || ''}
          onChange={(e) => onChange({ ...filtros, receta: e.target.value })}
        >
          <option value="">Todos</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
      </div>
    </div>
  )
}

export default FiltrosMedicamentos
