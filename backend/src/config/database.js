import './env.js'
import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

export async function verificarConexion() {
  const resultado = await pool.query('SELECT NOW() AS fecha_actual')
  return resultado.rows[0]
}

export async function prepararBaseDatos() {
  await pool.query(`
    ALTER TABLE usuario
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(180)
  `)

  await pool.query(`
    ALTER TABLE medicamento
    ADD COLUMN IF NOT EXISTS contenido VARCHAR(80)
  `)

  await pool.query(`
    ALTER TABLE lote
    ADD COLUMN IF NOT EXISTS id_med INTEGER
  `)

  await pool.query(`
    ALTER TABLE medicamento
    ALTER COLUMN id_lote DROP NOT NULL
  `)

  await pool.query(`
    ALTER TABLE cliente
    ADD COLUMN IF NOT EXISTS correo VARCHAR(100)
  `)

  await pool.query(`
    ALTER TABLE cliente
    ALTER COLUMN fecha_registro TYPE TIMESTAMP USING fecha_registro::timestamp
  `)

  await pool.query(`
    UPDATE cliente
    SET fecha_registro = fecha_registro - INTERVAL '6 hours'
    WHERE fecha_registro > ((NOW() AT TIME ZONE 'UTC') - INTERVAL '6 hours') + INTERVAL '5 minutes'
  `)

  await pool.query(`
    UPDATE medicamento
    SET contenido = presentacion
    WHERE contenido IS NULL
  `)

  await pool.query(`
    UPDATE lote l
    SET id_med = m.id_med
    FROM medicamento m
    WHERE m.id_lote = l.id_lote
      AND l.id_med IS NULL
  `)

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_lote_med'
      ) THEN
        ALTER TABLE lote
          ADD CONSTRAINT fk_lote_med FOREIGN KEY (id_med) REFERENCES medicamento(id_med);
      END IF;
    END $$
  `)

  await pool.query(`
    ALTER TABLE usuario
    ALTER COLUMN fecha_creacion TYPE TIMESTAMP USING fecha_creacion::timestamp
  `)

  await pool.query(`
    ALTER TABLE ventas
    ALTER COLUMN fecha_venta TYPE TIMESTAMP USING fecha_venta::timestamp
  `)

  await pool.query(`
    UPDATE ventas
    SET fecha_venta = fecha_venta - INTERVAL '6 hours'
    WHERE fecha_venta > (NOW() AT TIME ZONE 'America/Mexico_City') + INTERVAL '5 minutes'
  `)

  await pool.query(`
    UPDATE usuario
    SET fecha_creacion = fecha_creacion - INTERVAL '6 hours'
    WHERE fecha_creacion > ((NOW() AT TIME ZONE 'UTC') - INTERVAL '6 hours') + INTERVAL '5 minutes'
  `)

  await pool.query(`
    UPDATE usuario
    SET ultima_conexion = ultima_conexion - INTERVAL '6 hours'
    WHERE ultima_conexion > ((NOW() AT TIME ZONE 'UTC') - INTERVAL '6 hours') + INTERVAL '5 minutes'
  `)

  await pool.query(`
    UPDATE usuario
    SET
      rol = CASE
        WHEN LOWER(rol) IN ('administrador', 'admin') THEN 'admin'
        WHEN LOWER(rol) IN ('vendedor', 'cajero') THEN 'cajero'
        ELSE LOWER(rol)
      END
  `)

  await pool.query(`
    UPDATE usuario
    SET
      password_hash = COALESCE(
        password_hash,
        '8d3f85760f7f1bbdb83cb3d1d52f1b7f:205459b3c63dbaab2a0f83608c9456d71e42c693ee3b44d536a328e4af68294d97fcbd49867b68bf05a31bfa9d8856a42bace8197004c4c0029b2cf22473de79'
      )
    WHERE usuario = 'admin'
  `)

  await pool.query(`
    INSERT INTO usuario (
      usuario,
      rol,
      password_hash,
      fecha_creacion,
      nombre,
      ap_pat,
      telefono
    )
    VALUES (
      'admin',
      'admin',
      '8d3f85760f7f1bbdb83cb3d1d52f1b7f:205459b3c63dbaab2a0f83608c9456d71e42c693ee3b44d536a328e4af68294d97fcbd49867b68bf05a31bfa9d8856a42bace8197004c4c0029b2cf22473de79',
      (NOW() AT TIME ZONE 'UTC') - INTERVAL '6 hours',
      'Administrador',
      'General',
      '(312)0000000'
    )
    ON CONFLICT (usuario) DO NOTHING
  `)

  await pool.query(`
    INSERT INTO metodo_pago (nombre_metodo, descripcion)
    SELECT nombre_metodo, descripcion
    FROM (VALUES
      ('Efectivo', 'Pago en efectivo en mostrador'),
      ('Tarjeta de debito', 'Pago con tarjeta de debito'),
      ('Tarjeta de credito', 'Pago con tarjeta de credito'),
      ('Transferencia', 'Pago por transferencia bancaria'),
      ('CoDi', 'Pago digital CoDi')
    ) AS metodo(nombre_metodo, descripcion)
    WHERE NOT EXISTS (
      SELECT 1
      FROM metodo_pago mp
      WHERE LOWER(mp.nombre_metodo) = LOWER(metodo.nombre_metodo)
    )
  `)
}
