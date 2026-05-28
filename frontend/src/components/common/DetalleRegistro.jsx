function DetalleRegistro({ campos }) {
  return (
    <dl className="detalle-registro">
      {campos.map((campo) => (
        <div className="detalle-registro__fila" key={campo.etiqueta}>
          <dt>{campo.etiqueta}</dt>
          <dd>{campo.valor || '-'}</dd>
        </div>
      ))}
    </dl>
  )
}

export default DetalleRegistro
