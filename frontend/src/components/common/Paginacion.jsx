function Paginacion({ paginaActual, totalPaginas, totalRegistros, onChange }) {
  if (totalRegistros === 0 || totalPaginas <= 1) {
    return null
  }

  return (
    <div className="paginacion">
      <span>
        Pagina {paginaActual} de {totalPaginas} · {totalRegistros} registros
      </span>
      <div className="paginacion__acciones">
        <button
          className="boton boton--secundario boton--pequeno"
          type="button"
          disabled={paginaActual <= 1}
          onClick={() => onChange(paginaActual - 1)}
        >
          Anterior
        </button>
        <button
          className="boton boton--secundario boton--pequeno"
          type="button"
          disabled={paginaActual >= totalPaginas}
          onClick={() => onChange(paginaActual + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}

export default Paginacion
