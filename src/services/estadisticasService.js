import { obtenerVentas } from './ventasService'

const API_URL = import.meta.env.VITE_API_URL

function obtenerTotalVenta(venta) {
  return Number(venta.total_venta ?? venta.total ?? 0)
}

function formatearDiaLocal(fecha = new Date()) {
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function obtenerDiaVenta(venta) {
  if (venta.fecha_venta_dia) {
    return venta.fecha_venta_dia
  }

  if (venta.fecha_venta_iso) {
    return String(venta.fecha_venta_iso).slice(0, 10)
  }

  return ''
}

function obtenerHoraVenta(venta) {
  if (Number.isFinite(Number(venta.fecha_venta_hora))) {
    return Number(venta.fecha_venta_hora)
  }

  const hora = String(venta.fecha_venta_iso || '').match(/\s(\d{2}):/)
  return hora ? Number(hora[1]) : 0
}

function obtenerDiaCliente(cliente) {
  if (!cliente.fecha_registro) {
    return ''
  }

  const [fecha] = String(cliente.fecha_registro).split('|')
  const [day, month, year] = fecha.trim().split('-')
  return year && month && day ? `${year}-${month}-${day}` : ''
}

export async function obtenerEstadisticasDelDia() {
  try {
    const ventas = await obtenerVentas()

    const clientesResponse = await fetch(`${API_URL}/clientes`)
    if (!clientesResponse.ok) {
      throw new Error('Error al obtener clientes')
    }

    const clientesData = await clientesResponse.json()
    const clientes = clientesData.data || []

    const hoy = new Date()
    const diaHoy = formatearDiaLocal(hoy)
    const ventasHoy = ventas.filter((venta) => obtenerDiaVenta(venta) === diaHoy)

    const ingresosTotales = ventasHoy.reduce((sum, venta) => sum + obtenerTotalVenta(venta), 0)
    const numeroVentas = ventasHoy.length
    const ventaPromedio = numeroVentas > 0 ? ingresosTotales / numeroVentas : 0

    const ventasPorHora = {}
    ventasHoy.forEach((venta) => {
      const hora = obtenerHoraVenta(venta)
      const horaLabel = `${hora}:00`
      ventasPorHora[horaLabel] = (ventasPorHora[horaLabel] || 0) + obtenerTotalVenta(venta)
    })

    const datosGraficoHoras = Object.entries(ventasPorHora)
      .map(([hora, ingresos]) => ({ hora, ingresos }))
      .sort((a, b) => Number(a.hora.split(':')[0]) - Number(b.hora.split(':')[0]))

    const metodosPago = {}
    ventasHoy.forEach((venta) => {
      const metodo = venta.nombre_metodo || venta.metodoPago || 'No especificado'
      metodosPago[metodo] = (metodosPago[metodo] || 0) + obtenerTotalVenta(venta)
    })

    const datosMetodosPago = Object.entries(metodosPago)
      .map(([nombre, valor]) => ({
        nombre,
        valor,
        porcentaje: ingresosTotales > 0 ? Math.round((valor / ingresosTotales) * 100) : 0,
      }))
      .filter((dato) => dato.valor > 0)

    const tendenciaSemanal = []
    const clientesNuevos = []

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy)
      fecha.setDate(fecha.getDate() - i)
      const dia = formatearDiaLocal(fecha)
      const fechaLabel = fecha.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
      const ventasFecha = ventas.filter((venta) => obtenerDiaVenta(venta) === dia)
      const clientesFecha = clientes.filter((cliente) => obtenerDiaCliente(cliente) === dia)
      const ingresos = ventasFecha.reduce((sum, venta) => sum + obtenerTotalVenta(venta), 0)

      tendenciaSemanal.push({ fecha: fechaLabel, ingresos })
      clientesNuevos.push({ fecha: fechaLabel, clientes: clientesFecha.length })
    }

    return {
      ingresosTotales,
      numeroVentas,
      ventaPromedio,
      clientesTotales: clientes.length,
      usuariosTotales: 0,
      datosGraficoHoras,
      datosMetodosPago,
      tendenciaSemanal,
      clientesNuevos,
    }
  } catch (error) {
    console.error('Error en obtenerEstadisticasDelDia:', error)
    return {
      ingresosTotales: 0,
      numeroVentas: 0,
      ventaPromedio: 0,
      clientesTotales: 0,
      usuariosTotales: 0,
      datosGraficoHoras: [],
      datosMetodosPago: [],
      tendenciaSemanal: [],
      clientesNuevos: [],
    }
  }
}
