import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

import * as WayfinderNS from '@laravel/vite-plugin-wayfinder'
const wayfinder = (WayfinderNS as any).default ?? (WayfinderNS as any)

export default defineConfig({
  plugins: [
    vue(),
    // call the resolved plugin factory
    wayfinder(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
    },
  },
})
