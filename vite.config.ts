// vite.config.ts
// vite.config.ts
import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import { wayfinder } from '@laravel/vite-plugin-wayfinder' // <-- named export

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/js/app.ts'],
      refresh: true,
    }),
    wayfinder(), // minimal setup is fine
  ],
  resolve: {
    alias: {
      '@': '/resources/js',
    },
  },
})
