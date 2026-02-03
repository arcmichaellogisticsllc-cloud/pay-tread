"use client";

import InertiaEntry from '../inertia/page';

export default function BrokerPage() {
  // Render the Inertia client entry and ask it to load the Broker page
  return <InertiaEntry initialPage="Broker" />;
}
