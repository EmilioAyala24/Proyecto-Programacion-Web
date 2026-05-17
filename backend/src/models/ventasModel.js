import { pool } from '../config/database.js'

export async function obtenerVentas() {
  const consulta = `
    SELECT 
      v.id_ventas,
      v.fecha_venta,
      v.total_venta,
      u.nombre as usuario_nombre,
      mp.nombre_metodo,
      c.nombre as cliente_nombre,
      COUNT(dvm.id_detalle) as cantidad_medicamentos
    FROM ventas v
    LEFT JOIN usuario u ON v.id_usuario = u.id_usuario
    LEFT JOIN metodo_pago mp ON v.id_metPag = mp.id_metPag
    LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
    LEFT JOIN detalle_ventas_medicamento dvm ON v.id_ventas = dvm.id_ventas
    GROUP BY v.id_ventas, v.fecha_venta, v.total_venta, u.nombre, mp.nombre_metodo, c.nombre
    ORDER BY v.fecha_venta DESC
  `
  
  const resultado = await pool.query(consulta)
  return resultado.rows
}

export async function obtenerDetalleVenta(idVentas) {
  const consulta = `
    SELECT 
      dvm.id_detalle,
      m.nombre as medicamento_nombre,
      m.presentacion,
      m.concentracion,
      dvm.cantidad,
      dvm.precio_unitario,
      dvm.subtotal
    FROM detalle_ventas_medicamento dvm
    LEFT JOIN medicamento m ON dvm.id_medicamento = m.id_med
    WHERE dvm.id_ventas = $1
    ORDER BY dvm.id_detalle
  `
  
  const resultado = await pool.query(consulta, [idVentas])
  return resultado.rows
}

export async function crearVenta(idUsuario, idMetPag, idCliente, detalles) {
  const cliente = await pool.connect()
  
  try {
    await cliente.query('BEGIN')
    
    // Insertar venta
    const consultaVenta = `
      INSERT INTO ventas (id_usuario, id_metPag, id_cliente, fecha_venta, total_venta)
      VALUES ($1, $2, $3, NOW(), $4)
      RETURNING id_ventas
    `
    
    // Calcular total
    const total = detalles.reduce((sum, item) => sum + (item.subtotal || 0), 0)
    
    const resultadoVenta = await cliente.query(consultaVenta, [
      idUsuario,
      idMetPag,
      idCliente || null,
      total
    ])
    
    const idVentas = resultadoVenta.rows[0].id_ventas
    
    // Insertar detalles y actualizar stock
    for (const detalle of detalles) {
      const consultaDetalle = `
        INSERT INTO detalle_ventas_medicamento (id_ventas, id_medicamento, cantidad, precio_unitario, subtotal)
        VALUES ($1, $2, $3, $4, $5)
      `
      
      await cliente.query(consultaDetalle, [
        idVentas,
        detalle.id_medicamento,
        detalle.cantidad,
        detalle.precio_unitario,
        detalle.subtotal
      ])
      
      // Actualizar stock del lote
      const consultaActualizarStock = `
        UPDATE lote 
        SET stock_actual = stock_actual - $1
        WHERE id_lote = (
          SELECT id_lote FROM medicamento WHERE id_med = $2
        )
      `
      
      await cliente.query(consultaActualizarStock, [detalle.cantidad, detalle.id_medicamento])
    }
    
    await cliente.query('COMMIT')
    return { id_ventas: idVentas, total }
  } catch (error) {
    await cliente.query('ROLLBACK')
    throw error
  } finally {
    cliente.release()
  }
}

export async function obtenerMetodosPago() {
  const consulta = 'SELECT id_metPag, nombre_metodo FROM metodo_pago ORDER BY nombre_metodo'
  
  const resultado = await pool.query(consulta)
  return resultado.rows
}

export async function obtenerClientes() {
  const consulta = `
    SELECT id_cliente, nombre, ap_pat, ap_mat, telefono
    FROM cliente
    ORDER BY nombre
  `
  
  const resultado = await pool.query(consulta)
  return resultado.rows
}

export async function obtenerMedicamentosDisponibles() {
  const consulta = `
    SELECT 
      m.id_med,
      m.nombre,
      m.presentacion,
      m.concentracion,
      m.requiere_receta,
      l.stock_actual,
      l.precio_venta,
      l.id_lote
    FROM medicamento m
    LEFT JOIN lote l ON m.id_lote = l.id_lote
    WHERE l.stock_actual > 0 AND l.activo = TRUE
    ORDER BY m.nombre
  `
  
  const resultado = await pool.query(consulta)
  return resultado.rows
}
