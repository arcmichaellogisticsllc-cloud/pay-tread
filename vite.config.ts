// vite.config.ts
import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import path from 'path'

export default defineConfig({
  plugins: [
    laravel({
      // keep your real inputs here
      input: ['resources/css/app.css', 'resources/js/app.js'],
      refresh: true,
    }),
  ],
  resolve: {
    alias: {
      // ✅ absolute filesystem path (not "/resources/js")
      '@': path.resolve(__dirname, 'resources/js'),
    },
  },
})
