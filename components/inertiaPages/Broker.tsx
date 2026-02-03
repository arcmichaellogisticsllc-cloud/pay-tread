import React, { useState } from 'react';
import { useToasts } from '@/app/components/ToastProvider';

export default function Broker(props: any) {
  const loads = props.loads ?? [];
  const user = props.user ?? { email: 'broker@example.com' };
  const inertiaVisit = props.inertiaVisit as (p: string) => void | undefined;

  const [newRef, setNewRef] = useState('LOAD-' + Math.floor(Math.random() * 9000 + 1000));
  const [rate, setRate] = useState('150000');
  const [carrierEmail, setCarrierEmail] = useState('carrier@example.com');
  const [importing, setImporting] = useState(false);
  const toasts = useToasts();
  const [posting, setPosting] = useState(false);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  async function postLoad() {
    if (!newRef) return toasts.push({ message: 'Reference required', tone: 'error' });
    setPosting(true);
    const body = { reference: newRef, shipperEmail: user.email, grossAmount: Number(rate), currency: 'USD', rateCents: Number(rate), paymentMethod: 'ACH' };
    try {
      const res = await fetch('/api/loads', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-email': user.email }, body: JSON.stringify(body) });
      if (res.ok) {
        toasts.push({ message: 'Load posted', tone: 'success' });
        inertiaVisit?.('Broker');
      } else {
        const j = await res.json().catch(()=>({}));
        toasts.push({ message: j.error ?? 'failed to post load', tone: 'error' });
      }
    } finally { setPosting(false); }
  }

  async function assignCarrier(loadId: string) {
    setLoadingMap((s) => ({ ...s, [loadId]: true }));
    try {
      const res = await fetch(`/api/loads/${loadId}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-email': user.email }, body: JSON.stringify({ carrierEmail }) });
      if (res.ok) { toasts.push({ message: 'Carrier assigned', tone: 'success' }); inertiaVisit?.('Broker'); }
      else { const j = await res.json().catch(()=>({})); toasts.push({ message: j.error ?? 'failed assign', tone: 'error' }); }
    } finally { setLoadingMap((s) => ({ ...s, [loadId]: false })); }
  }

  async function authorizePayout(loadId: string) {
    setLoadingMap((s) => ({ ...s, [loadId]: true }));
    try {
      const res = await fetch(`/api/loads/${loadId}/authorize`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-email': user.email } });
      if (res.ok) { toasts.push({ message: 'Payout authorized', tone: 'success' }); inertiaVisit?.('Broker'); }
      else { const j = await res.json().catch(()=>({})); toasts.push({ message: j.error ?? 'failed authorize', tone: 'error' }); }
    } finally { setLoadingMap((s) => ({ ...s, [loadId]: false })); }
  }

  async function onCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImporting(true);
    try {
      const text = await f.text();
      const res = await fetch('/api/loads/import', { method: 'POST', headers: { 'Content-Type': 'text/csv', 'x-user-email': user.email }, body: text });
      if (res.ok) {
        toasts.push({ message: 'CSV import complete', tone: 'success' });
        inertiaVisit?.('Broker');
      } else {
        const j = await res.json().catch(()=>({})); toasts.push({ message: j.error ?? 'failed import', tone: 'error' });
      }
    } finally { setImporting(false); }
  }

  async function createPayoutSplit(loadId: string) {
    const load = loads.find((l: any) => l.id === loadId);
    if (!load) return toasts.push({ message: 'load not found', tone: 'error' });
    const gross = load.grossAmount ?? load.rateCents ?? 0;
    const carrierAmount = Math.floor(gross * 0.8);
    const brokerAmount = gross - carrierAmount;
    setLoadingMap((s) => ({ ...s, [loadId]: true }));
    try {
      await fetch(`/api/loads/${loadId}/payouts`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-email': user.email }, body: JSON.stringify({ amountCents: carrierAmount, method: 'instant_rtp' }) });
      await fetch(`/api/loads/${loadId}/payouts`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-email': user.email }, body: JSON.stringify({ amountCents: brokerAmount, method: 'instant_rtp' }) });
      toasts.push({ message: 'Payout split created', tone: 'success' });
      inertiaVisit?.('Broker');
    } finally { setLoadingMap((s) => ({ ...s, [loadId]: false })); }
  }

  async function submitPod(loadId: string) {
    setLoadingMap((s) => ({ ...s, [loadId]: true }));
    try {
      const res = await fetch(`/api/loads/${loadId}/pods`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-email': user.email }, body: JSON.stringify({ uploadedByEmail: 'carrier@example.com', mime: 'application/pdf' }) });
      if (res.ok) { toasts.push({ message: 'POD uploaded (mock)', tone: 'success' }); inertiaVisit?.('Broker'); }
      else { const j = await res.json().catch(()=>({})); toasts.push({ message: j.error ?? 'failed pod', tone: 'error' }); }
    } finally { setLoadingMap((s) => ({ ...s, [loadId]: false })); }
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Broker Dashboard</h1>
        <div>Signed in as <strong>{user.email}</strong></div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3>Post Load</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={newRef} onChange={e => setNewRef(e.target.value)} />
          <input value={rate} onChange={e => setRate(e.target.value)} style={{ width: 140 }} />
          <button onClick={postLoad}>Post Load</button>
        </div>

        <h3 style={{ marginTop: 18 }}>Import CSV</h3>
        <input type="file" accept="text/csv" onChange={onCsvFile} disabled={importing} />

        <h3 style={{ marginTop: 18 }}>Your Loads</h3>
        <div>
          {loads.length === 0 ? <div>No loads</div> : loads.map((l: any) => (
            <div key={l.id} style={{ padding: 8, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{l.reference ?? l.externalRef}</div>
                <div style={{ color: '#666' }}>Status: {l.status} — ${(l.grossAmount/100).toFixed(2)}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => assignCarrier(l.id)} disabled={!!loadingMap[l.id]}>Assign Carrier</button>
                <button onClick={() => createPayoutSplit(l.id)} disabled={!!loadingMap[l.id]}>Create Split</button>
                <button onClick={() => submitPod(l.id)} disabled={!!loadingMap[l.id]}>Upload POD</button>
                <button onClick={() => authorizePayout(l.id)} disabled={!!loadingMap[l.id] || posting}>Authorize Payout</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
