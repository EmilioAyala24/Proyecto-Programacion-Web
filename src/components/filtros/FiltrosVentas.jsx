function FiltrosVentas({ filtros, onChange }) {
  return (
    <div className="filtros-modulo">
      <div className="filtro-grupo">
        <label htmlFor="filtro-id">ID Venta</label>
        <input
          id="filtro-id"
          type="text"
          placeholder="Buscar por ID..."
          value={filtros.id || ''}
          onChange={(e) => onChange({ ...filtros, id: e.target.value })}
        />
      </div>

      <div className="filtro-grupo">
        <label htmlFor="filtro-cliente">Cliente</label>
        <input
          id="filtro-cliente"
          type="text"
          placeholder="Buscar por cliente..."
          value={filtros.cliente || ''}
          onChange={(e) => onChange({ ...filtros, cliente: e.target.value })}
        />
      </div>

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
    </div>
  )
}

export default FiltrosVentas
