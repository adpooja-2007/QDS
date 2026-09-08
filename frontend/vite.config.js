import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

let backendTarget = 'http://127.0.0.1:27621'
try {
  const portFilePath = path.resolve(__dirname, '../backend_port.json')
  if (fs.existsSync(portFilePath)) {
    const data = JSON.parse(fs.readFileSync(portFilePath, 'utf-8'))
    if (data.url) backendTarget = data.url
  }
} catch (e) {
  // fallback default
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
})

