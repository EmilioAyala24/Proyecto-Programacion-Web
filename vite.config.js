import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicHost = env.APP_PUBLIC_URL ? new URL(env.APP_PUBLIC_URL).hostname : undefined

  return {
    plugins: [react()],
    server: {
      allowedHosts: publicHost ? [publicHost] : [],
    },
  }
})
