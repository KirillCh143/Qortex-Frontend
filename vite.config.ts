import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // No proxy needed - SDK makes direct requests to http://localhost:8080 (nginx)
  // nginx handles CORS with Access-Control-Allow-Origin: http://localhost:5173
})
