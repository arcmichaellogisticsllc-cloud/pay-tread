import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { wayfinder } from '@laravel/vite-plugin-wayfinder'
import path from 'node:path'

export default defineConfig({
  plugins: [
    wayfinder(),          // ← no `input` option here
    vue(),
  ],
resolve: { alias: { '@': path.resolve(__dirname, 'resources/js'),
    },
  },
})
