import { useState } from 'react'

const clasesEstado = {
  Vigente: 'vigente',
  Proximo: 'proximo',
  Caducado: 'caducado',
}

function obtenerResumenLotes(medicamento) {
  if (medicamento.lotesCaducados > 0) {
    return {
      texto: `${medicamento.lotesCaducados} caducado(s)`,
      estado: 'Caducado',
    }
  }

  if (medicamento.lotesProximos > 0) {
    return {
      texto: `${medicamento.lotesProximos} próximo(s)`,
      estado: 'Proximo',
    }
  }

  return {
    texto: `${medicamento.lotesVigentes || 0} vigente(s)`,
    estado: 'Vigente',
  }
}

function MedicamentosTable({ medicamentos, onEditar, onEliminar, onVer, puedeGestionar = true }) {
  const [lotesAbiertos, setLotesAbiertos] = useState({})

  const alternarLotes = (id) => {
    setLotesAbiertos((actuales) => ({
      ...actuales,
      [id]: !actuales[id],
    }))
  }

  return (
    <div className="tabla-contenedor">
      <table className="tabla-datos">
        <thead>
          <tr>
            <th>Medicamento</th>
            <th>Presentación</th>
            <th>Concentración</th>
            <th>Contenido</th>
            <th>Receta</th>
            <th>Stock</th>
            <th>Lotes</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medicamentos.map((medicamento) => {
            const resumen = obtenerResumenLotes(medicamento)
            const estaAbierto = Boolean(lotesAbiertos[medicamento.id])

            return (
              <tr key={medicamento.id}>
                <td>
                  <button
                    className="enlace-tabla"
                    type="button"
                    onClick={() => onVer(medicamento)}
                  >
                    {medicamento.nombre}
                  </button>
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
                <td>
                  <div className="lotes-resumen">
                    <button
                      className={`lotes-resumen__boton lotes-resumen__boton--${clasesEstado[resumen.estado]}`}
                      type="button"
                      onClick={() => alternarLotes(medicamento.id)}
                    >
                      <span className="lotes-resumen__punto" />
                      <strong>{resumen.texto}</strong>
                      <span aria-hidden="true">{estaAbierto ? '-' : '+'}</span>
                    </button>
                    {estaAbierto && (
                      <div className="lotes-resumen__detalle">
                        <span>Total: {medicamento.totalLotes}</span>
                        <span>Bien: {medicamento.lotesVigentes}</span>
                        <span>Próximos: {medicamento.lotesProximos}</span>
                        <span>Caducados: {medicamento.lotesCaducados}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="acciones-tabla">
                    <button className="boton-accion" type="button" onClick={() => onVer(medicamento)}>
                      Ver
                    </button>
                    {puedeGestionar && (
                      <>
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
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default MedicamentosTable
