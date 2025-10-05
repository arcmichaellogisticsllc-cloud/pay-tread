// vite.config.ts
import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { wayfinder } from '@laravel/vite-plugin-wayfinder'
import path from 'path'

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.ts'],
      refresh: true, // remove `ssr:` if you don't have resources/js/ssr.ts
    }),
    tailwindcss(),
    wayfinder({ formVariants: true }),
    vue({
      template: { transformAssetUrls: { base: null, includeAbsolute: false } },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'resources/js'),
    },
  },
})
