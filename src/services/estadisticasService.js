const API_URL = import.meta.env.VITE_API_URL

function obtenerTotalVenta(venta) {
  return Number(venta.total_venta ?? venta.total ?? 0)
}

export async function obtenerEstadisticasDelDia() {
  try {
    // Obtener todas las ventas
    const ventasResponse = await fetch(`${API_URL}/ventas`)
    if (!ventasResponse.ok) {
      throw new Error('Error al obtener ventas')
    }

    const ventasData = await ventasResponse.json()
    const ventas = ventasData.data || []

    // Obtener todos los clientes
    const clientesResponse = await fetch(`${API_URL}/clientes`)
    if (!clientesResponse.ok) {
      throw new Error('Error al obtener clientes')
    }

    const clientesData = await clientesResponse.json()
    const clientes = clientesData.data || []

    // Hoy (para filtrar ventas del día)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    // Filtrar ventas de hoy
    const ventasHoy = ventas.filter((venta) => {
      const fechaVenta = new Date(venta.fecha_venta || venta.fecha)
      fechaVenta.setHours(0, 0, 0, 0)
      return fechaVenta.getTime() === hoy.getTime()
    })

    // Calcular estadísticas
    const ingresosTotales = ventasHoy.reduce((sum, venta) => sum + obtenerTotalVenta(venta), 0)
    const numeroVentas = ventasHoy.length
    const ventaPromedio = numeroVentas > 0 ? ingresosTotales / numeroVentas : 0

    // Agrupar ventas por hora
    const ventasPorHora = {}
    ventasHoy.forEach((venta) => {
      const fecha = new Date(venta.fecha_venta || venta.fecha)
      const hora = fecha.getHours()
      const horaLabel = `${hora}:00`
      ventasPorHora[horaLabel] = (ventasPorHora[horaLabel] || 0) + obtenerTotalVenta(venta)
    })

    // Convertir a formato para gráfico
    const datosGraficoHoras = Object.entries(ventasPorHora)
      .map(([hora, ingresos]) => ({ hora, ingresos }))
      .sort((a, b) => {
        const horaA = parseInt(a.hora)
        const horaB = parseInt(b.hora)
        return horaA - horaB
      })

    // Métodos de pago (si está disponible en los datos)
    const metodosPago = {}
    ventasHoy.forEach((venta) => {
      const metodo = venta.nombre_metodo || venta.metodoPago || venta.metodo_pago || 'Efectivo'
      metodosPago[metodo] = (metodosPago[metodo] || 0) + obtenerTotalVenta(venta)
    })

    const datosMetodosPago = Object.entries(metodosPago)
      .map(([nombre, valor]) => ({
        nombre,
        valor,
        porcentaje: ingresosTotales > 0 ? Math.round((valor / ingresosTotales) * 100) : 0,
      }))
      .filter((d) => d.valor > 0)

    // Últimos 7 días para tendencia
    const tendenciaSemanal = []
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy)
      fecha.setDate(fecha.getDate() - i)
      fecha.setHours(0, 0, 0, 0)

      const ventasFecha = ventas.filter((venta) => {
        const fechaVenta = new Date(venta.fecha_venta || venta.fecha)
        fechaVenta.setHours(0, 0, 0, 0)
        return fechaVenta.getTime() === fecha.getTime()
      })

      const ingresos = ventasFecha.reduce((sum, venta) => sum + obtenerTotalVenta(venta), 0)
      const fechaLabel = fecha.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })

      tendenciaSemanal.push({ fecha: fechaLabel, ingresos })
    }

    return {
      ingresosTotales,
      numeroVentas,
      ventaPromedio,
      clientesTotales: clientes.length,
      usuariosTotales: 0, // No es necesario contar usuarios ahora
      datosGraficoHoras,
      datosMetodosPago,
      tendenciaSemanal,
    }
  } catch (error) {
    console.error('Error en obtenerEstadisticasDelDia:', error)
    // Retornar valores en cero, no datos inventados
    return {
      ingresosTotales: 0,
      numeroVentas: 0,
      ventaPromedio: 0,
      clientesTotales: 0,
      usuariosTotales: 0,
      datosGraficoHoras: [],
      datosMetodosPago: [],
      tendenciaSemanal: [],
    }
  }
}
