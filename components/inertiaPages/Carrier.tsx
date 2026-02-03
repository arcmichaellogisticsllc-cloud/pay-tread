import React, { useState } from 'react';
import { useToasts } from '@/app/components/ToastProvider';
import { useConfirm } from '@/app/components/ConfirmProvider';

export default function Carrier(props: any) {
  const loads = props.loads ?? [];
  const wallet = props.wallet ?? null;
  const user = props.user ?? { email: 'carrier@example.com' };
  const inertiaVisit = props.inertiaVisit as (p: string) => void | undefined;

  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
  const toasts = useToasts();
  const confirmFn = useConfirm();
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  async function acceptOffer(loadId: string) {
    setLoadingMap((s) => ({ ...s, [loadId]: true }));
    try {
      const res = await fetch(`/api/loads/${loadId}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-email': user.email }, body: JSON.stringify({ carrierEmail: user.email }) });
      if (res.ok) { toasts.push({ message: 'Offer accepted', tone: 'success' }); inertiaVisit?.('Carrier'); }
      else { const j = await res.json().catch(()=>({})); toasts.push({ message: j.error ?? 'failed accept', tone: 'error' }); }
    } finally { setLoadingMap((s) => ({ ...s, [loadId]: false })); }
  }

  async function uploadPod(loadId: string) {
    setLoadingMap((s) => ({ ...s, [loadId]: true }));
    try {
      const res = await fetch(`/api/loads/${loadId}/pods`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-email': user.email }, body: JSON.stringify({ uploadedByEmail: user.email, mime: 'application/pdf' }) });
      if (res.ok) { toasts.push({ message: 'POD uploaded (mock)', tone: 'success' }); inertiaVisit?.('Carrier'); }
      else { const j = await res.json().catch(()=>({})); toasts.push({ message: j.error ?? 'failed pod', tone: 'error' }); }
    } finally { setLoadingMap((s) => ({ ...s, [loadId]: false })); }
  }

  async function requestPayout(loadId: string) {
    const load = loads.find((l:any) => l.id === loadId);
    const amt = load?.grossAmount ?? load?.rateCents ?? 0;
  const ok = await confirmFn(`Request payout for $${(amt/100).toFixed(2)} ?`);
    if (!ok) return;
    setLoadingMap((s) => ({ ...s, [loadId]: true }));
    try {
      const res = await fetch(`/api/loads/${loadId}/payouts`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-email': user.email }, body: JSON.stringify({ amountCents: amt, method: 'instant_rtp' }) });
      if (res.ok) { toasts.push({ message: 'Payout requested', tone: 'success' }); inertiaVisit?.('Carrier'); }
      else { const j = await res.json().catch(()=>({})); toasts.push({ message: j.error ?? 'failed payout', tone: 'error' }); }
    } finally { setLoadingMap((s) => ({ ...s, [loadId]: false })); }
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Carrier Dashboard</h1>
        <div>Signed in as <strong>{user.email}</strong></div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div>Wallet: {wallet ? `${(wallet.balanceCents/100).toFixed(2)} USD` : 'no wallet'}</div>
      </div>

      <h3 style={{ marginTop: 18 }}>Loads assigned to you</h3>
      <div>
        {loads.length === 0 ? <div>No loads</div> : loads.map((l: any) => (
          <div key={l.id} style={{ padding: 8, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{l.reference ?? l.externalRef}</div>
              <div style={{ color: '#666' }}>Status: {l.status} — ${(l.grossAmount/100).toFixed(2)}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => acceptOffer(l.id)} disabled={!!loadingMap[l.id]}>Accept</button>
              <button onClick={() => uploadPod(l.id)} disabled={!!loadingMap[l.id]}>Upload POD</button>
              <button onClick={() => requestPayout(l.id)} disabled={!!loadingMap[l.id]}>Request Payout</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
