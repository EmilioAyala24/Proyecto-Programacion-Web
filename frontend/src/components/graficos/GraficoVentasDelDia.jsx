import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

function GraficoVentasDelDia({ datos }) {
  const formatoPrecio = (value) => Number(value || 0).toFixed(2)

  return (
    <div className="grafico-contenedor">
      <h3>Ventas por hora</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hora" />
          <YAxis />
          <Tooltip 
            contentStyle={{ background: '#fff', border: '1px solid #ccc' }}
            formatter={(value) => [`$${formatoPrecio(value)}`, 'Ingresos']}
          />
          <Legend />
          <Bar dataKey="ingresos" fill="#3b82f6" name="Ingresos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default GraficoVentasDelDia
