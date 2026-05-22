import './config/env.js'
import app from './app.js'
import { prepararBaseDatos } from './config/database.js'

const PORT = process.env.PORT ?? 3001

try {
  await prepararBaseDatos()

  app.listen(PORT, () => {
    console.log(`API Farmacia Inclusiva escuchando en puerto ${PORT}`)
  })
} catch (error) {
  console.error('No fue posible preparar la base de datos:', error.message)
  process.exit(1)
}
