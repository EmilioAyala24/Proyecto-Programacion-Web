import { useState } from 'react'
import './FiltrosModulo.css'

const filtrosVacios = {
  nombre: '',
  stock: '',
  caducidad: '',
  receta: '',
}

function FiltrosMedicamentos({ filtros, onChange }) {
  const [borrador, setBorrador] = useState({ ...filtrosVacios, ...filtros })

  const actualizar = (campo, valor) => {
    setBorrador((actual) => ({ ...actual, [campo]: valor }))
  }

  const limpiar = () => {
    setBorrador(filtrosVacios)
    onChange(filtrosVacios)
  }

  return (
    <form className="filtros-modulo filtros-modulo--acciones" onSubmit={(e) => {
      e.preventDefault()
      onChange(borrador)
    }}>
      <span className="filtros-modulo__titulo">Filtros</span>

      <div className="filtro-grupo">
        <label htmlFor="filtro-nombre">Nombre</label>
        <input
          id="filtro-nombre"
          type="text"
          placeholder="Buscar por nombre..."
          value={borrador.nombre}
          onChange={(e) => actualizar('nombre', e.target.value)}
        />
      </div>

      <div className="filtro-grupo">
        <label htmlFor="filtro-stock">Estado de stock</label>
        <select
          id="filtro-stock"
          value={borrador.stock}
          onChange={(e) => actualizar('stock', e.target.value)}
        >
          <option value="">-- Todos --</option>
          <option value="con-stock">Con stock</option>
          <option value="sin-stock">Sin stock</option>
        </select>
      </div>

      <div className="filtro-grupo">
        <label htmlFor="filtro-caducidad">Estado de caducidad</label>
        <select
          id="filtro-caducidad"
          value={borrador.caducidad}
          onChange={(e) => actualizar('caducidad', e.target.value)}
        >
          <option value="">-- Todos --</option>
          <option value="Vigente">Vigente</option>
          <option value="Proximo">Próximo</option>
          <option value="Caducado">Caducado</option>
        </select>
      </div>

      <div className="filtro-grupo">
        <label htmlFor="filtro-receta">Requiere receta</label>
        <select
          id="filtro-receta"
          value={borrador.receta}
          onChange={(e) => actualizar('receta', e.target.value)}
        >
          <option value="">-- Todos --</option>
          <option value="si">Si</option>
          <option value="no">No</option>
        </select>
      </div>

      <div className="filtros-modulo__botones">
        <button className="boton boton--primario" type="submit">Filtrar</button>
        <button className="boton boton--secundario" type="button" onClick={limpiar}>Limpiar</button>
      </div>
    </form>
  )
}

export default FiltrosMedicamentos
