import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

export default defineConfig(async ({ command }) => {
  let server = {}
  if (command === 'serve') {
    const devProxyConfigPath = fileURLToPath(
      new URL('./dev.proxy.config.js', import.meta.url)
    )

    try {
      await fs.access(devProxyConfigPath)
      const devProxyConfig = await import(devProxyConfigPath)
      server = {
        proxy: devProxyConfig.default,
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.log('No proxy configuration found, skipping proxy setup.')
    }
  }
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server,
  }
})
