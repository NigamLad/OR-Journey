import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA(
      {
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true
        },
        scope: "/",
        manifest: {
          name: 'OR Journey',
          short_name: 'Journey',
          description: "Experience the operation you didn't see",
          theme_color: '#000000',
          icons: [
            {
              src: "/src/assets/Journey Logo White.svg",
            }
          ],
          workbox: {
            maximumFileSizeToCacheInBytes: 100000000000
          }
        }
      }
    )
  ],
  server: {
    host: 'localhost',
    port: 5173,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
