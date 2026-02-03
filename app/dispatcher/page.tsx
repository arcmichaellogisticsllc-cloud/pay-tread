"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useToasts } from "../components/ToastProvider";

export default function DispatcherPage(){
  const [me, setMe] = useState<any>(null);
  const [loads, setLoads] = useState<any[]>([]);
  const [carrierEmail, setCarrierEmail] = useState('carrier@example.com');
  const toasts = useToasts();

  const refreshLoads = () => fetch('/api/loads').then(r=>r.json()).then(j=>setLoads(j.data||[])).catch(()=>setLoads([]));

  useEffect(()=>{
    fetch('/api/users/me', { headers: { 'x-user-email': 'dispatcher@example.com' } }).then(r=>r.json()).then(j=>setMe(j.data)).catch(()=>{});
    refreshLoads();
  },[]);

  const assignCarrier = async (loadId:string) => {
    const res = await fetch(`/api/loads/${loadId}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ carrierEmail }) });
    const j = await res.json().catch(()=>({}));
    if (res.ok) { toasts.push({ message: 'Carrier assigned', tone: 'success' }); refreshLoads(); }
    else toasts.push({ message: j.error ?? 'failed assign', tone: 'error' });
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Dispatcher Dashboard</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/debug"><button style={{ padding: '8px 12px' }}>Debug</button></Link>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 14, color: '#6b7a90' }}>Signed in as <strong style={{ marginLeft: 8 }}>{me?.email ?? 'dispatcher@example.com'}</strong></div>

        <section style={{ marginTop: 12 }}>
          <h3 style={{ fontSize: 16 }}>Assigned Loads</h3>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8 }}>
            {loads.length === 0 ? <div style={{ padding: 12 }}>No loads</div> : loads.map(l=> (
              <div key={l.id} style={{ padding: 8, borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{l.reference ?? l.externalRef}</div>
                  <div style={{ color: '#6b7280' }}>{l.status} — Gross: ${(l.grossAmount/100).toFixed(2)}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={carrierEmail} onChange={e=>setCarrierEmail(e.target.value)} style={{ padding: '6px' }} />
                  <button onClick={()=>assignCarrier(l.id)} style={{ padding: '8px 12px' }}>Assign Carrier</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
