import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function GraficoClientesNuevos({ datos }) {
  return (
    <div className="grafico-contenedor grafico-contenedor--compacto">
      <h3>Clientes nuevos</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value) => [value, 'Clientes']} />
          <Bar dataKey="clientes" fill="#10b981" name="Clientes" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default GraficoClientesNuevos
