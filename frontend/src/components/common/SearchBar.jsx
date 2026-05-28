import './SearchBar.css'

function SearchBar({ valor, onChange, placeholder = 'Buscar...' }) {
  return (
    <div className="search-bar">
      <svg className="search-bar__icono" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        className="search-bar__input"
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
      />
      {valor && (
        <button
          type="button"
          className="search-bar__limpiar"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default SearchBar
