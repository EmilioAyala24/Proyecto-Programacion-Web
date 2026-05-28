function FiltrosUsuarios({ filtros, onChange }) {
  return (
    <div className="filtros-modulo">
      <div className="filtro-grupo">
        <label htmlFor="filtro-usuario">Usuario</label>
        <input
          id="filtro-usuario"
          type="text"
          placeholder="Buscar por usuario..."
          value={filtros.usuario || ''}
          onChange={(e) => onChange({ ...filtros, usuario: e.target.value })}
        />
      </div>

      <div className="filtro-grupo">
        <label htmlFor="filtro-rol">Rol</label>
        <select
          id="filtro-rol"
          value={filtros.rol || ''}
          onChange={(e) => onChange({ ...filtros, rol: e.target.value })}
        >
          <option value="">Todos</option>
          <option value="admin">Administrador</option>
          <option value="cajero">Cajero/Vendedor</option>
        </select>
      </div>
    </div>
  )
}

export default FiltrosUsuarios
