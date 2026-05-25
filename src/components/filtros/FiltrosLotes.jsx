import { useState } from 'react'
import './FiltrosModulo.css'

const filtrosVacios = {
  busqueda: '',
  stock: '',
  caducidad: '',
  medicamento: '',
}

function FiltrosLotes({ filtros, medicamentos = [], onChange }) {
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
        <label htmlFor="filtro-lote">Lote o proveedor</label>
        <input
          id="filtro-lote"
          type="text"
          placeholder="Buscar lote..."
          value={borrador.busqueda}
          onChange={(e) => actualizar('busqueda', e.target.value)}
        />
      </div>

      <div className="filtro-grupo">
        <label htmlFor="filtro-lote-stock">Estado de stock</label>
        <select
          id="filtro-lote-stock"
          value={borrador.stock}
          onChange={(e) => actualizar('stock', e.target.value)}
        >
          <option value="">-- Todos --</option>
          <option value="con-stock">Con stock</option>
          <option value="sin-stock">Sin stock</option>
        </select>
      </div>

      <div className="filtro-grupo">
        <label htmlFor="filtro-lote-caducidad">Estado de caducidad</label>
        <select
          id="filtro-lote-caducidad"
          value={borrador.caducidad}
          onChange={(e) => actualizar('caducidad', e.target.value)}
        >
          <option value="">-- Todos --</option>
          <option value="Vigente">Vigente</option>
          <option value="Proximo">Proximo</option>
          <option value="Caducado">Caducado</option>
        </select>
      </div>

      <div className="filtro-grupo">
        <label htmlFor="filtro-lote-medicamento">Medicamento</label>
        <select
          id="filtro-lote-medicamento"
          value={borrador.medicamento}
          onChange={(e) => actualizar('medicamento', e.target.value)}
        >
          <option value="">-- Todos --</option>
          {medicamentos.map((medicamento) => (
            <option key={medicamento.id} value={medicamento.id}>
              {medicamento.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="filtros-modulo__botones">
        <button className="boton boton--primario" type="submit">Filtrar</button>
        <button className="boton boton--secundario" type="button" onClick={limpiar}>Limpiar</button>
      </div>
    </form>
  )
}

export default FiltrosLotes
