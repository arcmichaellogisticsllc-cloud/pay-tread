import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import laravel from 'laravel-vite-plugin'
import { wayfinder } from '@laravel/vite-plugin-wayfinder'
import path from 'node:path'

export default defineConfig({
  plugins: [
    // Laravel plugin provides the build entries (so Vite doesn't look for index.html)
    laravel({
      input: ['resources/js/app.ts', 'resources/css/app.css'], // adjust to your real entries
      refresh: true,
    }),

    // Wayfinder just generates types for routes/actions
    wayfinder(),

    vue(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'resources/js'),
    },
  },
})
