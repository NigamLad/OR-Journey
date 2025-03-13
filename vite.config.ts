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
                    background_color: '#000000',
                    orientation: 'portrait-primary',
                    icons: [
                        {
                            "purpose": "maskable",
                            "sizes": "1024x1024",
                            "src": "/icons/Journey Logo White.png",
                            "type": "image/png"
                        },
                        {
                            "purpose": "maskable",
                            "sizes": "48x48",
                            "src": "/icons/Journey Logo White_x48.png",
                            "type": "image/png"
                        },
                        {
                            "purpose": "maskable",
                            "sizes": "72x72",
                            "src": "/icons/Journey Logo White_x72.png",
                            "type": "image/png"
                        },
                        {
                            "purpose": "maskable",
                            "sizes": "96x96",
                            "src": "/icons/Journey Logo White_x96.png",
                            "type": "image/png"
                        },
                        {
                            "purpose": "maskable",
                            "sizes": "128x128",
                            "src": "/icons/Journey Logo White_x128.png",
                            "type": "image/png"
                        },
                        {
                            "purpose": "any",
                            "sizes": "144x144",
                            "src": "/icons/Journey Logo White_x144.png",
                            "type": "image/png"
                        },
                        {
                            "purpose": "maskable",
                            "sizes": "192x192",
                            "src": "/icons/Journey Logo White_x192.png",
                            "type": "image/png"
                        },
                        {
                            "purpose": "maskable",
                            "sizes": "384x384",
                            "src": "/icons/Journey Logo White_x384.png",
                            "type": "image/png"
                        },
                        {
                            "purpose": "maskable",
                            "sizes": "512x512",
                            "src": "/icons/Journey Logo White_x512.png",
                            "type": "image/png"
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
