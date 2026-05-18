import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function GraficoTendenciaSemanal({ datos }) {
  return (
    <div className="grafico-contenedor">
      <h3>Tendencia de ingresos - Últimos 7 días</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={datos}>
          <defs>
            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" />
          <YAxis />
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          <Area
            type="monotone"
            dataKey="ingresos"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorIngresos)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default GraficoTendenciaSemanal
