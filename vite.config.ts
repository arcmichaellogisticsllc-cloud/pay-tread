// vite.config.ts
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import wayfinder from '@laravel/vite-plugin-wayfinder';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    laravel({
      input: 'resources/js/app.ts',
      refresh: true,
    }),
    vue(),       // <-- MUST be present so .vue SFCs compile
    wayfinder(), // optional, keep if you’re using it
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
    },
  },
});
