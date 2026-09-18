import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',

      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'favicon-96x96.png',
        'apple-touch-icon.png',
        'logo.webp',
        'backgrounds/*.webp',
        'flags/*.svg',
        'fonts/*.woff2',
      ],

      manifest: {
        id: '/',
        scope: '/',
        start_url: '/',

        name: 'Meds Reminder',
        short_name: 'Meds',
        description: 'A simple medication reminder and tracking app.',

        theme_color: '#5e45e5',
        background_color: '#09090b',

        display: 'standalone',
        orientation: 'portrait-primary',

        icons: [
          {
            src: '/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,svg,png,webp,webmanifest,woff2,ico}',
        ],

        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],

        cleanupOutdatedCaches: true,
      },

      devOptions: {
        enabled: false,
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  preview: {
    allowedHosts: true,
  },

  server: {
    host: '0.0.0.0',
    port: 6173,
  },
});