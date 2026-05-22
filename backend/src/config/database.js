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
      CURRENT_DATE,
      'Administrador',
      'General',
      '3120000000'
    )
    ON CONFLICT (usuario) DO NOTHING
  `)
}
