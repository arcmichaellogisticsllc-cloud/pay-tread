import '../css/app.css'

import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'

const appName = import.meta.env.VITE_APP_NAME || 'Laravel'

createInertiaApp({
  resolve: (name) =>
    resolvePageComponent(
      `./pages/${name}.vue`,
      import.meta.glob('./pages/**/*.vue')

  // ✅ Explicit resolver keeps TS happy
  resolve: async (name) => {
    const pages = import.meta.glob('./pages/**/*.vue') // lazy modules
    const importPage = pages[`./pages/${name}.vue`]
    if (!importPage) {
      throw new Error(`Page not found: ./pages/${name}.vue`)
    }
    const mod: any = await importPage()
    return mod.default
  },

  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },

  progress: { color: '#4B5563' },
})
