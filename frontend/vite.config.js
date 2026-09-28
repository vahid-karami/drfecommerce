import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Django dev server; override with VITE_BACKEND_URL in .env.local
  const backend = env.VITE_BACKEND_URL || 'http://localhost:8000'
  // changeOrigin: Django sees its own host, so ALLOWED_HOSTS works behind a tunnel.
  const proxy = {
    '/api': { target: backend, changeOrigin: true },
    '/media': { target: backend, changeOrigin: true },
  }
  // Hosts allowed to reach the dev/preview server, e.g. a Cloudflare quick tunnel for demos.
  const allowedHosts = ['.trycloudflare.com', ...(env.VITE_ALLOWED_HOSTS || '').split(',').filter(Boolean)]

  return {
    plugins: [react()],
    server: { proxy, allowedHosts },
    preview: { proxy, allowedHosts },
  }
})
