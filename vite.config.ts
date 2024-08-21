import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import fs, { constants } from 'node:fs/promises'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  let devProxyConfig = {}

  try {
    await fs.access('./dev.proxy.config.ts', constants.F_OK)
    devProxyConfig = (await import('./dev.proxy.config')).default
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    console.log('No dev.proxy.config.ts found, skipping proxy setup.')
  }
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: devProxyConfig,
    },
  }
})
