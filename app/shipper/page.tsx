"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToasts } from '../components/ToastProvider';

export default function ShipperPage() {
  const [me, setMe] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loads, setLoads] = useState<any[]>([]);
  const [reference, setReference] = useState(() => 'LOAD-' + Math.floor(Math.random()*9000+1000));
  const [gross, setGross] = useState('200000');
  const [carrierEmail, setCarrierEmail] = useState('carrier@example.com');
  const [selectedLoad, setSelectedLoad] = useState<any | null>(null);
  const [selectedPods, setSelectedPods] = useState<Record<string, string>>({});
  const toasts = useToasts();

  const refresh = () => {
    fetch('/api/loads').then(r => r.json()).then(j => setLoads(j.data || [])).catch(() => setLoads([]));
  };

  const fetchWallet = () => {
    fetch('/api/wallets/me', { headers: { 'x-user-email': 'broker@example.com' } }).then(r => r.json()).then(j => setWallet(j.data)).catch(() => setWallet(null));
  };

  useEffect(() => {
    fetch('/api/users/me', { headers: { 'x-user-email': 'shipper@example.com' } })
      .then(r => r.json()).then(j => setMe(j.data)).catch(() => {});
    refresh();
    fetchWallet();
  }, []);

  const createLoad = async () => {
    const body = { reference, shipperEmail: me?.email ?? 'broker@example.com', grossAmount: Number(gross), currency: 'USD', rateCents: Number(gross), paymentMethod: 'ACH' };
    const res = await fetch('/api/loads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) { toasts.push({ message: 'Load created', tone: 'success' }); refresh(); }
    else toasts.push({ message: j.error ?? 'failed create', tone: 'error' });
  };

  const holdFunds = async (loadId: string) => {
    const res = await fetch(`/api/loads/${loadId}/hold`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) { toasts.push({ message: 'Funds held', tone: 'success' }); fetchWallet(); }
    else toasts.push({ message: j.error ?? 'failed hold', tone: 'error' });
  };

  const assignCarrier = async (loadId: string) => {
    const res = await fetch(`/api/loads/${loadId}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ carrierEmail }) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) { toasts.push({ message: 'Carrier invited/assigned', tone: 'success' }); refresh(); }
    else toasts.push({ message: j.error ?? 'failed assign', tone: 'error' });
  };

  const releaseFunds = async (loadId: string) => {
    // prefer an explicitly selected pod, otherwise pick the first
    const load = loads.find(l => l.id === loadId);
    const selectedPodId = selectedPods[loadId];
    const pod = selectedPodId ? (load?.pods || []).find((p:any)=>p.id===selectedPodId) : (load?.pods || [])[0];
    if (!pod) return toasts.push({ message: 'No POD found for load', tone: 'error' });
    const res = await fetch(`/api/loads/${loadId}/release`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ podId: pod.id, approvedBy: me?.email ?? 'shipper@example.com' }) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) { toasts.push({ message: 'Funds released and carrier credited', tone: 'success' }); fetchWallet(); refresh(); }
    else toasts.push({ message: j.error ?? 'failed release', tone: 'error' });
  };

    const inspectLedger = async (walletId: string) => {
    const res = await fetch('/api/ledger');
    const j = await res.json().catch(() => ({}));
    const rows = j.data || [];
    const filtered = rows.filter((r:any) => r.walletId === walletId);
    toasts.push({ message: JSON.stringify(filtered.slice(0,5)), tone: 'default' });
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Shipper / Receiver Dashboard</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/debug"><button>Debug</button></Link>
        </div>
      </div>

      <section style={{ marginTop: 12, border: '1px solid #e5e7eb', padding: 12, borderRadius: 8 }}>
        <h3>Create Load</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={reference} onChange={e => setReference(e.target.value)} />
          <input value={gross} onChange={e => setGross(e.target.value)} />
          <button onClick={createLoad}>Create</button>
        </div>
      </section>

      <section style={{ marginTop: 12, border: '1px solid #e5e7eb', padding: 12, borderRadius: 8 }}>
        <h3>Payment & Wallet</h3>
        <div>Wallet: {wallet ? `${(wallet.balanceCents/100).toFixed(2)} USD (available), pending ${(wallet.pendingCents/100).toFixed(2)}` : 'No wallet info'}</div>
        <div style={{ marginTop: 8 }}>
          <button onClick={() => fetchWallet()}>Refresh Wallet</button>
        </div>
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Your Loads</h3>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8 }}>
          {loads.length === 0 ? <div>No loads</div> : loads.map(l => (
            <div key={l.id} style={{ padding: 8, borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{l.reference ?? l.externalRef}</div>
                <div style={{ color: '#6b7280' }}>{l.status} — Gross: ${(l.grossAmount/100).toFixed(2)}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={carrierEmail} onChange={e => setCarrierEmail(e.target.value)} style={{ padding: '4px' }} />
                <button onClick={() => assignCarrier(l.id)} disabled={!(me?.role === 'BROKER' || me?.role === 'ADMIN' || me?.id === l.shipperId)} title={!(me?.role === 'BROKER' || me?.role === 'ADMIN' || me?.id === l.shipperId) ? 'Only broker, shipper or admin can assign carriers' : ''}>Invite/Assign Carrier</button>
                <button onClick={() => holdFunds(l.id)} disabled={!(me?.id === l.shipperId || me?.role === 'BROKER' || me?.role === 'ADMIN')} title={!(me?.id === l.shipperId || me?.role === 'BROKER' || me?.role === 'ADMIN') ? 'Only shipper, broker or admin can hold funds' : ''}>Hold Funds</button>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select value={selectedPods[l.id] ?? ''} onChange={e => setSelectedPods(s => ({ ...s, [l.id]: e.target.value }))}>
                    <option value="">Select POD</option>
                    {(l.pods || []).map((p:any) => <option key={p.id} value={p.id}>{p.id} — {p.status}</option>)}
                  </select>
                  <button onClick={() => releaseFunds(l.id)} disabled={!(me?.id === l.shipperId || me?.role === 'BROKER' || me?.role === 'ADMIN')} title={!(me?.id === l.shipperId || me?.role === 'BROKER' || me?.role === 'ADMIN') ? 'Only shipper, broker or admin can release funds' : ''}>Confirm Delivery / Release</button>
                </div>
                <button onClick={() => inspectLedger(l.walletId)}>View Ledger</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
