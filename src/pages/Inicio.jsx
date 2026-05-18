import { useEffect, useState } from 'react'
import GraficoMetodosPago from '../components/graficos/GraficoMetodosPago'
import GraficoTendenciaSemanal from '../components/graficos/GraficoTendenciaSemanal'
import GraficoVentasDelDia from '../components/graficos/GraficoVentasDelDia'
import TarjetaMetrica from '../components/graficos/TarjetaMetrica'
import { obtenerEstadisticasDelDia } from '../services/estadisticasService'

function Inicio() {
  const [estadisticas, setEstadisticas] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const formatoPrecio = (valor) => Number(valor || 0).toFixed(2)

  useEffect(() => {
    obtenerEstadisticasDelDia()
      .then(setEstadisticas)
      .catch((err) => {
        console.error('Error al cargar estadísticas:', err)
        setError(err.message)
      })
      .finally(() => setCargando(false))
  }, [])

  if (cargando) {
    return <p style={{ textAlign: 'center', padding: '40px' }}>Cargando estadísticas...</p>
  }

  if (!estadisticas) {
    return <p style={{ textAlign: 'center', padding: '40px' }}>No hay datos disponibles</p>
  }

  return (
    <section className="inicio-pagina">
      <div className="encabezado-pagina">
        <span className="encabezado-pagina__etiqueta">Bienvenido</span>
        <h1>Inicio</h1>
        <p>Panel de control con estadísticas y métricas en tiempo real del negocio.</p>
      </div>

      {error && <div className="alerta-error" style={{ marginBottom: '20px' }}>{error}</div>}

      {/* Métricas principales */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <TarjetaMetrica
          titulo="Ingresos del día"
          valor={`$${formatoPrecio(estadisticas.ingresosTotales)}`}
          subtitulo="Total acumulado"
          icono="💰"
          color="#10b981"
        />
        <TarjetaMetrica
          titulo="Ventas realizadas"
          valor={estadisticas.numeroVentas}
          subtitulo="Transacciones completadas"
          icono="🛒"
          color="#3b82f6"
        />
        <TarjetaMetrica
          titulo="Venta promedio"
          valor={`$${formatoPrecio(estadisticas.ventaPromedio)}`}
          subtitulo="Monto promedio por venta"
          icono="📊"
          color="#f59e0b"
        />
        <TarjetaMetrica
          titulo="Clientes totales"
          valor={estadisticas.clientesTotales}
          subtitulo="En el sistema"
          icono="👥"
          color="#8b5cf6"
        />
      </div>

      {/* Gráficos principales */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <GraficoVentasDelDia datos={estadisticas.datosGraficoHoras} />
        <GraficoMetodosPago datos={estadisticas.datosMetodosPago} />
      </div>

      {/* Gráfico de tendencia */}
      <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <GraficoTendenciaSemanal datos={estadisticas.tendenciaSemanal} />
      </div>
    </section>
  )
}

export default Inicio
