function UsuariosTable({ usuarios, onEliminar }) {
  const formatoFecha = (fecha) => {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-CO')
  }

  const rolesBadge = {
    admin: '#ff6b6b',
    cajero: '#4ecdc4',
  }

  const rolesNombres = {
    admin: 'Administrador',
    cajero: 'Cajero/Vendedor',
  }

  return (
    <div className="tabla-contenedor">
      <table className="tabla-datos">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Teléfono</th>
            <th>Creación</th>
            <th>Última Conexión</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>
                <strong>{usuario.usuario}</strong>
              </td>
              <td>{usuario.nombre}</td>
              <td>
                <span
                  style={{
                    background: rolesBadge[usuario.rol] || '#999',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {rolesNombres[usuario.rol] || usuario.rol}
                </span>
              </td>
              <td>{usuario.telefono || '-'}</td>
              <td>{formatoFecha(usuario.fechaCreacion)}</td>
              <td>{formatoFecha(usuario.ultimaConexion)}</td>
              <td>
                <button
                  className="boton-accion boton-accion--eliminar"
                  onClick={() => onEliminar(usuario.id)}
                  title="Eliminar"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UsuariosTable
