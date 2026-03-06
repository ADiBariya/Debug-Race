import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,

    allowedHosts: [
      "girlfriend-damaged-trying-semi.trycloudflare.com"
    ],

    proxy: {
      '/api': {
        target: "https://debug-race-production.up.railway.app/api",
        changeOrigin: true
      },
      '/socket.io': {
        target: "https://debug-race-production.up.railway.app/api",
        ws: true
      }
    }
  }
})
