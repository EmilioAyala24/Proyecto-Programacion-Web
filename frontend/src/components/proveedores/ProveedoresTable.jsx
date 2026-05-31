import { useState } from 'react'

function ProveedoresTable({ proveedores, onEditar, onEliminar, onVer }) {
  const [tooltipDireccion, setTooltipDireccion] = useState(null)

  const mostrarTooltipDireccion = (event, direccion) => {
    setTooltipDireccion({
      texto: direccion,
      x: event.clientX,
      y: event.clientY,
    })
  }

  const moverTooltipDireccion = (event) => {
    setTooltipDireccion((actual) => actual && {
      ...actual,
      x: event.clientX,
      y: event.clientY,
    })
  }

  return (
    <>
      <div className="tabla-contenedor">
        <table className="tabla-datos proveedores-tabla">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Telefono</th>
              <th>Correo</th>
              <th>Direccion</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((proveedor) => (
              <tr key={proveedor.id}>
                <td>
                  <strong>{proveedor.nombre}</strong>
                </td>
                <td>{proveedor.telefono}</td>
                <td>{proveedor.correo}</td>
                <td className="proveedores-tabla__direccion">
                  <span
                    onMouseEnter={(event) => mostrarTooltipDireccion(event, proveedor.direccion)}
                    onMouseMove={moverTooltipDireccion}
                    onMouseLeave={() => setTooltipDireccion(null)}
                    onFocus={(event) => mostrarTooltipDireccion(event, proveedor.direccion)}
                    onBlur={() => setTooltipDireccion(null)}
                    tabIndex={0}
                  >
                    {proveedor.direccion}
                  </span>
                </td>
                <td>
                  <span className={`estado estado--${proveedor.estado.toLowerCase()}`}>
                    {proveedor.estado}
                  </span>
                </td>
                <td>
                  <div className="acciones-tabla">
                    <button className="boton-accion" type="button" onClick={() => onVer(proveedor)}>
                      Ver
                    </button>
                    <button className="boton-accion" type="button" onClick={() => onEditar(proveedor)}>
                      Editar
                    </button>
                    <button
                      className="boton-accion boton-accion--eliminar"
                      type="button"
                      onClick={() => onEliminar(proveedor.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tooltipDireccion && (
        <div
          className="tooltip-direccion"
          style={{
            left: tooltipDireccion.x + 14,
            top: tooltipDireccion.y + 14,
          }}
          role="tooltip"
        >
          {tooltipDireccion.texto}
        </div>
      )}
    </>
  )
}

export default ProveedoresTable
