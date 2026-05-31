import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORES_METODOS_PAGO = {
  credito: '#e88839',
  efectivo: '#2abf4d',
  debito: '#3b82f6',
}

function normalizarMetodoPago(nombre = '') {
  return String(nombre)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function obtenerColorMetodoPago(nombre) {
  const metodo = normalizarMetodoPago(nombre)

  if (metodo.includes('credito')) {
    return COLORES_METODOS_PAGO.credito
  }

  if (metodo.includes('efectivo')) {
    return COLORES_METODOS_PAGO.efectivo
  }

  if (metodo.includes('debito')) {
    return COLORES_METODOS_PAGO.debito
  }

  return '#64748b'
}

function GraficoMetodosPago({ datos }) {
  const formatoPrecio = (value) => Number(value || 0).toFixed(2)

  return (
    <div className="grafico-contenedor">
      <h3>Métodos de pago</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={datos}
            cx="50%"
            cy="50%"
            outerRadius={72}
            fill="#8884d8"
            dataKey="valor"
            nameKey="nombre"
          >
            {datos.map((entry) => (
              <Cell key={entry.nombre} fill={obtenerColorMetodoPago(entry.nombre)} />
            ))}
          </Pie>
          <Tooltip formatter={(value, _name, item) => [`$${formatoPrecio(value)}`, item.payload.nombre]} />
          <Legend formatter={(value, entry) => entry.payload?.nombre ?? value} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default GraficoMetodosPago
