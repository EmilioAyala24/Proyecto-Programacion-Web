function ContadorCaracteres({ valor, maximo }) {
  return (
    <span className="contador-caracteres" aria-live="polite">
      {String(valor ?? '').length}/{maximo}
    </span>
  )
}

export default ContadorCaracteres
