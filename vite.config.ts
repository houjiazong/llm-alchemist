import { defineConfig, loadEnv, type UserConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createHtmlPlugin } from 'vite-plugin-html'

export default defineConfig(async ({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())
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
    plugins: [
      react(),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            title: env.VITE_APP_TITLE || 'LLM Alchemist',
            favicon:
              env.VITE_APP_FAVICON_URL || env.VITE_APP_LOGO_URL || '/logo.svg',
          },
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server,
  } as UserConfig
})
