import fs from 'node:fs/promises'
import { createServer as createHttpServer } from 'node:http'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createServer as createViteServer } from 'vite'
import './config/env.js'
import app from './app.js'
import { prepararBaseDatos } from './config/database.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')
const PORT = Number(process.env.PORT ?? 5173)

try {
  await prepararBaseDatos()

  const httpServer = createHttpServer(app)

  const vite = await createViteServer({
    root,
    appType: 'custom',
    server: {
      hmr: {
        server: httpServer,
      },
      middlewareMode: true,
    },
  })

  app.use(vite.middlewares)

  app.use(async (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next()
    }

    try {
      const template = await fs.readFile(path.resolve(root, 'index.html'), 'utf-8')
      const html = await vite.transformIndexHtml(req.originalUrl, template)
      return res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (error) {
      vite.ssrFixStacktrace(error)
      return next(error)
    }
  })

  httpServer.listen(PORT, () => {
    console.log(`Farmacia Inclusiva dev escuchando frontend y API en http://localhost:${PORT}`)
  })
} catch (error) {
  console.error('No fue posible iniciar el servidor dev:', error.message)
  process.exit(1)
}
