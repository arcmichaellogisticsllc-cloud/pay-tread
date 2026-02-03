"use client";

import React, { useEffect, useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import Broker from '@/components/inertiaPages/Broker';
import Carrier from '@/components/inertiaPages/Carrier';

const componentMap: Record<string, React.ComponentType<any>> = {
  Broker,
  Carrier,
};

export default function InertiaEntry({ initialPage: initialPageProp }: { initialPage?: string } = {}) {
  const url = typeof window !== 'undefined' ? new URL(window.location.href) : null;
  const initialPage = initialPageProp ?? url?.searchParams.get('page') ?? 'Broker';
  const [componentName, setComponentName] = useState<string>(initialPage);
  const [props, setProps] = useState<any>({});
  const [loading, setLoading] = useState(true);

  async function loadPage(name: string) {
    setLoading(true);
    const res = await fetch(`/api/inertia/page?page=${encodeURIComponent(name)}`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      setProps({ error: 'failed_fetch' });
      setComponentName('NotFound');
      setLoading(false);
      return;
    }
    const payload = await res.json();
    setComponentName(payload.component);
    setProps(payload.props ?? {});
    setLoading(false);
  }

  useEffect(() => {
    loadPage(initialPage);
    // simple popstate handling
    const onPop = () => {
      const p = new URL(window.location.href).searchParams.get('page') ?? 'Broker';
      loadPage(p);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function visit(name: string) {
    // use Inertia to manage history (optional) and then load
    Inertia.visit(`?page=${encodeURIComponent(name)}`, { preserveState: true, replace: false });
    loadPage(name);
  }

  const Comp = componentMap[componentName] ?? (() => <div>Unknown component: {componentName}</div>);

  return (
    <div style={{ padding: 20 }}>
      <nav style={{ marginBottom: 12 }}>
        <button onClick={() => visit('Broker')} style={{ marginRight: 8 }}>Broker</button>
        <button onClick={() => visit('Carrier')}>Carrier</button>
      </nav>
      {loading ? <div>Loading...</div> : <Comp {...props} inertiaVisit={visit} />}
    </div>
  );
}
