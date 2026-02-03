"use client";

import InertiaEntry from '../inertia/page';

export default function CarrierPage() {
  // Render the Inertia client entry and ask it to load the Carrier page
  return <InertiaEntry initialPage="Carrier" />;
}
