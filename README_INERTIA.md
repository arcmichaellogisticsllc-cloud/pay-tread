Inertia integration (dev)

This project contains a lightweight Inertia-style integration for local development.

Files added:
- `app/inertia/page.tsx` — client entry that fetches /api/inertia/page?page=... and renders mapped components.
- `app/api/inertia/page/route.ts` — server endpoint returning { component, props } for Broker and Carrier pages.
- `components/inertiaPages/Broker.tsx` and `Carrier.tsx` — example Inertia page components.

Usage:
- Start dev server: `npm run dev`
- Visit: `http://localhost:3000/inertia?page=Broker` or `?page=Carrier`

Notes:
- This is a minimal, pragmatic approach to using Inertia-style payloads with Next.js app router in dev.
- For a more complete integration (forms, partial reloads, file uploads), expand the server payloads and use the full @inertiajs/react helpers.
