INSERT INTO metodo_pago (id_metPag, nombre_metodo, descripcion) VALUES
(1, 'Efectivo', 'Pago en efectivo en mostrador'),
(2, 'Tarjeta de debito', 'Pago con tarjeta bancaria'),
(3, 'Transferencia', 'Pago por transferencia bancaria'),
(4, 'Tarjeta de credito', 'Pago con tarjeta de credito'),
(5, 'CoDi', 'Pago digital CoDi')
ON CONFLICT (id_metPag) DO NOTHING;

INSERT INTO usuario (id_usuario, usuario, rol, password_hash, fecha_creacion, nombre, ap_pat, ap_mat, telefono) VALUES
(1, 'admin', 'admin', '8d3f85760f7f1bbdb83cb3d1d52f1b7f:205459b3c63dbaab2a0f83608c9456d71e42c693ee3b44d536a328e4af68294d97fcbd49867b68bf05a31bfa9d8856a42bace8197004c4c0029b2cf22473de79', (NOW() AT TIME ZONE 'UTC') - INTERVAL '6 hours', 'Administrador', 'General', NULL, '(312)0000000')
ON CONFLICT (id_usuario) DO NOTHING;

INSERT INTO cliente (id_cliente, nombre, ap_pat, ap_mat, fecha_registro, telefono, correo) VALUES
(1, 'Publico', 'General', NULL, ((NOW() AT TIME ZONE 'UTC') - INTERVAL '6 hours')::timestamp, NULL, NULL),
(2, 'Juan', 'Perez', 'Lopez', ((NOW() AT TIME ZONE 'UTC') - INTERVAL '6 hours')::timestamp, '(312)1112233', 'juan.perez@correo.com'),
(3, 'Ana', 'Rodriguez', 'Garcia', ((NOW() AT TIME ZONE 'UTC') - INTERVAL '6 hours')::timestamp, '(312)4445566', 'ana.rodriguez@correo.com')
ON CONFLICT (id_cliente) DO NOTHING;

INSERT INTO medicamento (
  id_med,
  nombre,
  presentacion,
  concentracion,
  contenido,
  requiere_receta,
  fecha_registro,
  estado_colorimetria
) VALUES
(1, 'Paracetamol', 'Tabletas', '500 mg', '20 tabletas', FALSE, CURRENT_DATE, 'verde'),
(2, 'Amoxicilina', 'Capsulas', '500 mg', '12 capsulas', TRUE, CURRENT_DATE, 'amarillo'),
(3, 'Ibuprofeno', 'Tabletas', '400 mg', '10 tabletas', FALSE, CURRENT_DATE, 'sin_stock')
ON CONFLICT (id_med) DO NOTHING;

INSERT INTO lote (
  id_lote,
  id_prov,
  id_med,
  numero_lote,
  fecha_fabricacion,
  fecha_caducidad,
  fecha_ingreso,
  stock_actual,
  activo,
  fecha_compra,
  precio_compra,
  precio_venta
) VALUES
(1, 1, 1, 'L-2026-001', '2026-01-10', '2027-01-15', '2026-04-18', 126, TRUE, '2026-04-17', 18.00, 30.00),
(2, 2, 2, 'L-2026-014', '2025-12-12', '2026-06-10', '2026-03-27', 42, TRUE, '2026-03-26', 42.00, 65.00),
(3, 3, 3, 'L-2025-089', '2025-03-01', '2026-03-01', '2025-09-12', 0, FALSE, '2025-09-11', 28.00, 48.00)
ON CONFLICT (id_lote) DO NOTHING;

SELECT setval('metodo_pago_id_metpag_seq', COALESCE((SELECT MAX(id_metPag) FROM metodo_pago), 1));
SELECT setval('usuario_id_usuario_seq', COALESCE((SELECT MAX(id_usuario) FROM usuario), 1));
SELECT setval('cliente_id_cliente_seq', COALESCE((SELECT MAX(id_cliente) FROM cliente), 1));
SELECT setval('lote_id_lote_seq', COALESCE((SELECT MAX(id_lote) FROM lote), 1));
SELECT setval('medicamento_id_med_seq', COALESCE((SELECT MAX(id_med) FROM medicamento), 1));
