import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/letterlift/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'LetterLift',
        short_name: 'LetterLift',
        description:
          'Free, private reading helper: bolds the start of each word so text is easier to follow. Your text never leaves your device.',
        start_url: '/letterlift/',
        scope: '/letterlift/',
        display: 'standalone',
        background_color: '#FBF7F0',
        theme_color: '#FF6B4A',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
        share_target: {
          action: '/letterlift/',
          method: 'GET',
          params: { title: 'title', text: 'text', url: 'url' },
        },
      },
      workbox: {
        // pdf.js worker is ~1.3 MB; precache it so PDFs work offline.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2,webmanifest}', '**/*.mjs'],
        navigateFallback: '/letterlift/index.html',
        // Share-target URLs carry ?query; ignore it when matching the precached shell.
        ignoreURLParametersMatching: [/^title$/, /^text$/, /^url$/],
      },
    }),
  ],
  build: {
    rolldownOptions: {
      output: {
        // Split react (and rolldown's runtime helper) into shared chunks so the lazy docx chunk is not preloaded at startup.
        codeSplitting: {
          groups: [{ name: 'react-vendor', test: /node_modules[\/](react|react-dom|scheduler)[\/]/ }],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    globals: false,
  },
})
