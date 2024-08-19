import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import devProxyConfig from './dev.proxy.config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: devProxyConfig,
  },
})
