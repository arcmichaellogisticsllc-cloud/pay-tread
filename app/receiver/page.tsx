"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToasts } from '../components/ToastProvider';

export default function ReceiverPage(){
  const [me, setMe] = useState<any>(null);
  const [loads, setLoads] = useState<any[]>([]);
  const toasts = useToasts();

  const fetchLoads = () => fetch('/api/loads').then(r=>r.json()).then(j=>setLoads(j.data||[])).catch(()=>setLoads([]));

  useEffect(()=>{
    fetch('/api/users/me', { headers: { 'x-user-email': 'receiver@example.com' } }).then(r=>r.json()).then(j=>setMe(j.data)).catch(()=>{});
    fetchLoads();
  },[]);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Receiver Dashboard</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/debug"><button>Debug</button></Link>
        </div>
      </div>

      <section style={{ marginTop: 12 }}>
        <h3>Loads for Receiver</h3>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8 }}>
          {loads.length === 0 ? <div>No loads</div> : loads.filter(l => l.receiverId === me?.id).map(l => (
            <div key={l.id} style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ fontWeight: 700 }}>{l.reference ?? l.externalRef}</div>
              <div style={{ color: '#6b7280' }}>{l.status} — Gross: ${(l.grossAmount/100).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
