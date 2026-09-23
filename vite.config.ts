import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Rutas relativas para que funcione en GitHub Pages (usuario.github.io/repo/)
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Arsenal de Tyria',
        short_name: 'Arsenal',
        description: 'Buscador de objetos, recetas y precios de Guild Wars 2',
        lang: 'es',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#141312',
        theme_color: '#1e1c1a',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        runtimeCaching: [
          {
            // Catálogo: se muestra al instante desde caché y se actualiza en segundo plano
            urlPattern: ({ url }) => url.pathname.endsWith('/data/items.json'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'catalog', expiration: { maxEntries: 2 } },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'render.guildwars2.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'icons',
              expiration: { maxEntries: 3000, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Datos públicos de la API (no la cuenta): red primero, caché si no hay conexión
            urlPattern: ({ url }) =>
              url.hostname === 'api.guildwars2.com' && !url.searchParams.has('access_token'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
})
