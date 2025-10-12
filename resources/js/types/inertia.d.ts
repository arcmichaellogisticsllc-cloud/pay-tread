// resources/js/types/inertia.d.ts
export {}

declare module '@inertiajs/core' {
  interface PageProps {
    name: string
    quote: { message: string; author: string }
    auth: { user: null | { id: number; name: string; email: string } }
    sidebarOpen: boolean
    flash: { success?: string; error?: string }
  }
}
