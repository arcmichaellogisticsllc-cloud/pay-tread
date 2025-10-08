import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { wayfinder } from '@laravel/vite-plugin-wayfinder'
import path from 'node:path'

export default defineConfig({
  plugins: [
    wayfinder({
      input: ['resources/js/app.ts'],
      refresh: true,
    }),
    vue(),
  ], // ← plugins array CLOSED and comma present
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'resources/js'),
    },
  },
})
