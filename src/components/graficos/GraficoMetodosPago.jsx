import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

function GraficoMetodosPago({ datos }) {
  const COLORES = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
  const formatoPrecio = (value) => Number(value || 0).toFixed(2)

  return (
    <div className="grafico-contenedor">
      <h3>Métodos de pago</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={datos}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ nombre, porcentaje }) => `${nombre} ${porcentaje}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="valor"
          >
            {datos.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`$${formatoPrecio(value)}`, 'Total']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default GraficoMetodosPago
