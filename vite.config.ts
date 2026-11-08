import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/CuervosApp/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-cuervos.png', 'logo-cuervos.svg', 'favicon.ico', 'robots.txt'],
      manifest: {
        name: 'CuervosApp - Táctica & Sustituciones',
        short_name: 'CuervosApp',
        description: 'Pizarra táctica interactiva, sustituciones inteligentes y base de conocimiento para Cuervos Básquetbol',
        theme_color: '#0A0A0C',
        background_color: '#050505',
        display: 'standalone',
        orientation: 'any',
        start_url: '/CuervosApp/',
        scope: '/CuervosApp/',
        icons: [
          {
            src: '/CuervosApp/logo-cuervos.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/CuervosApp/logo-cuervos.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  server: {
    host: true,
    port: 3000
  }
});
