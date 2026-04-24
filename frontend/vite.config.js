import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Groove — Your Friendly Helper',
        short_name: 'Groove',
        description: 'AI voice companion for scam protection, reminders, and everyday help',
        start_url: '/',
        display: 'standalone',
        background_color: '#F0F7F8',
        theme_color: '#3BBFBF',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        categories: ['health', 'lifestyle', 'utilities'],
        shortcuts: [
          { name: 'Scam Guard',  short_name: 'Scams',    url: '/?tab=scam',  description: 'Check a suspicious call' },
          { name: 'To-Do List',  short_name: 'Tasks',    url: '/?tab=todo',  description: 'View reminders' },
          { name: 'Help Me',     short_name: 'Help',     url: '/?tab=help',  description: 'Book cab or food' },
          { name: 'Ask Away',    short_name: 'Ask',      url: '/?tab=ask',   description: 'Medical & banking help' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^\/api\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 } },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
