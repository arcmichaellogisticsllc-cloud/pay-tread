import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import * as Wayfinder from '@laravel/vite-plugin-wayfinder'

function resolveWayfinder() {
  const mod: any = Wayfinder
  const candidate = mod?.default ?? mod?.wayfinder ?? mod
  return typeof candidate === 'function' ? candidate() : candidate
}

export default defineConfig({
  plugins: [vue(), resolveWayfinder()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      // Tell Vite what to build (adjust if your entry is app.js)
      input: fileURLToPath(new URL('./resources/js/app.ts', import.meta.url)),
    },
  },
})
