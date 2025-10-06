// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// Import the module namespace so we can handle any export shape
import * as Wayfinder from '@laravel/vite-plugin-wayfinder'

// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// Import the module namespace so we can handle any export shape
import * as Wayfinder from '@laravel/vite-plugin-wayfinder'

// Pick whichever export the package provides, and call it if it's a function
function resolveWayfinder() {
  const mod: any = Wayfinder
  const candidate = mod?.default ?? mod?.wayfinder ?? mod
  return typeof candidate === 'function' ? candidate() : candidate
}

export default defineConfig({
  plugins: [
    vue(),
    resolveWayfinder(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
    },
  },
})
