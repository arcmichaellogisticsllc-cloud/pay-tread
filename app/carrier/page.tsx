"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useToasts } from "../components/ToastProvider";

export default function CarrierPage() {
  const [me, setMe] = useState<any>(null);
  const [loads, setLoads] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [selectedLoad, setSelectedLoad] = useState<any | null>(null);
  const toasts = useToasts();

  useEffect(() => {
    fetch('/api/users/me', { headers: { 'x-user-email': 'carrier@example.com' } })
      .then(r => r.json())
      .then(j => setMe(j.data))
      .catch(() => toasts.push({ message: 'Failed to load user', tone: 'error' }));

    refreshAll();
  }, []);

  const refreshAll = () => {
    fetch('/api/loads').then(r => r.json()).then(j => {
      const all = j.data || [];
      setLoads(all.filter((l:any) => l.assignedCarrier?.email === 'carrier@example.com' || l.carrierId));
      // treat offered/posteds as offers
      setOffers(all.filter((l:any) => ['Offered','Posted','POSTED','OFFERED'].includes((l.status || '').toString())));
    }).catch(() => { setLoads([]); setOffers([]); });

    fetch('/api/ledger').then(r => r.json()).then(j => setLedger(j.data || [])).catch(() => setLedger([]));
  };

  const acceptOffer = async (loadId: string) => {
    // call assign endpoint to accept (assign self as carrier)
    const res = await fetch(`/api/loads/${loadId}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ carrierEmail: me?.email ?? 'carrier@example.com' }) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      toasts.push({ message: 'Offer accepted', tone: 'success' });
      refreshAll();
    } else {
      toasts.push({ message: j.error ?? 'failed to accept', tone: 'error' });
    }
  };

  const rejectOffer = async (loadId: string) => {
    // mark as REJECTED via status update
    const res = await fetch(`/api/loads/${loadId}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'REJECTED' }) });
    if (res.ok) {
      toasts.push({ message: 'Offer rejected', tone: 'default' });
      refreshAll();
    } else {
      toasts.push({ message: 'Failed to reject', tone: 'error' });
    }
  };

  const counterOffer = async (loadId: string, amountCents: number) => {
    // create a simple counter by updating status and posting a notification to broker
    const res = await fetch(`/api/loads/${loadId}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'COUNTERED', note: JSON.stringify({ counterAmount: amountCents }) }) });
    if (res.ok) {
      toasts.push({ message: 'Counter offered', tone: 'success' });
      refreshAll();
    } else {
      toasts.push({ message: 'Failed to send counter', tone: 'error' });
    }
  };

  const uploadPod = async (loadId: string) => {
    const res = await fetch(`/api/loads/${loadId}/pods`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uploadedByEmail: me?.email ?? 'carrier@example.com', mime: 'application/pdf' }) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      toasts.push({ message: 'POD uploaded (mock)', tone: 'success' });
      refreshAll();
    } else {
      toasts.push({ message: j.error ?? 'failed pod', tone: 'error' });
    }
  };

  const requestPayout = async (loadId: string, amountCents?: number) => {
    const load = loads.find(l => l.id === loadId) || selectedLoad;
    const amt = amountCents ?? load?.grossAmount ?? load?.rateCents ?? 0;
    const res = await fetch(`/api/loads/${loadId}/payouts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amountCents: amt, method: 'instant_rtp', requestedBy: me?.email }) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      toasts.push({ message: 'Payout requested', tone: 'success' });
      refreshAll();
    } else {
      toasts.push({ message: j.error ?? 'failed payout', tone: 'error' });
    }
  };

  const myWalletId = me?.walletId ?? null;
  const myLedger = ledger.filter((r:any) => r.walletId === myWalletId);

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Carrier Dashboard</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/debug"><button style={{ padding: '8px 12px' }}>Debug</button></Link>
          <Link href="/broker"><button style={{ padding: '8px 12px' }}>Broker View</button></Link>
        </div>
      </div>

      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Dashboard: Active Loads, Earnings Overview */}
        <section style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Active Loads & Earnings</h2>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 700 }}>Wallet Balance</div>
            <div style={{ color: '#6b7280', marginBottom: 8 }}>{(myLedger.reduce((s:any, r:any)=>s+(r.amountCents||0),0)/100).toFixed(2)} USD (calc from ledger)</div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>Active Loads</div>
            {loads.length === 0 ? <div style={{ color: '#6b7280' }}>No active loads</div> : loads.map(l => (
              <div key={l.id} style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ fontWeight: 700 }}>{l.reference ?? l.externalRef}</div>
                <div style={{ color: '#6b7280' }}>{l.status} — Gross: ${(l.grossAmount/100).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Load Offers */}
        <section style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Load Offers</h2>
          <div style={{ marginTop: 8 }}>
            {offers.length === 0 ? <div style={{ color: '#6b7280' }}>No offers</div> : offers.map(o => (
              <div key={o.id} style={{ padding: 8, borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{o.reference ?? o.externalRef}</div>
                  <div style={{ color: '#6b7280' }}>Rate: ${(o.rateCents/100).toFixed(2)} — {o.miles ?? '—'} miles</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => acceptOffer(o.id)} className="px-3 py-1 bg-emerald-200 rounded">Accept</button>
                  <button onClick={() => rejectOffer(o.id)} className="px-3 py-1 bg-red-200 rounded">Reject</button>
                  <button onClick={() => counterOffer(o.id, Math.max(0, (o.rateCents || 0) - 5000))} className="px-3 py-1 bg-yellow-200 rounded">Counter</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* POD Upload & Geolocation Confirmation */}
        <section style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>POD Upload & Geolocation</h2>
          <div style={{ marginTop: 8 }}>
            <div style={{ color: '#6b7280', marginBottom: 8 }}>Select an active load below to upload POD and confirm geolocation (dev mock).</div>
            {loads.length === 0 ? <div style={{ color: '#6b7280' }}>No active loads</div> : loads.map(l => (
              <div key={l.id} style={{ padding: 8, borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{l.reference ?? l.externalRef}</div>
                  <div style={{ color: '#6b7280' }}>Pods: {(l.pods||[]).length}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => uploadPod(l.id)} className="px-3 py-1 bg-sky-200 rounded">Upload POD</button>
                  <button onClick={() => toasts.push({ message: 'Geolocation confirmed (mock)', tone: 'success' })} className="px-3 py-1 bg-indigo-200 rounded">Confirm Geo</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Wallet & Payout View */}
        <section style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Wallet & Payouts</h2>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 700 }}>Balance (ledger)</div>
            <div style={{ color: '#6b7280' }}>{(myLedger.reduce((s:any,r:any)=>s+(r.amountCents||0),0)/100).toFixed(2)} USD</div>
            <div style={{ marginTop: 8 }}>
              <h4 style={{ marginBottom: 6 }}>Recent Ledger</h4>
              {myLedger.length === 0 ? <div style={{ color: '#6b7280' }}>No transactions</div> : myLedger.slice(0,6).map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ color: '#0a2540' }}>{tx.type}</div>
                  <div style={{ color: tx.amountCents < 0 ? '#dc2626' : '#047857' }}>{(tx.amountCents/100).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 10 }}>
              <button onClick={() => selectedLoad ? requestPayout(selectedLoad) : toasts.push({ message: 'Select a load then click Inspect to set it', tone: 'info' })} className="px-3 py-1 bg-emerald-300 rounded">Request Payout for selected</button>
            </div>
          </div>
        </section>
      </div>

              <div style={{ marginTop: 8 }}>
              <button onClick={() => selectedLoad ? requestPayout(selectedLoad) : toasts.push({ message: 'Select a load then click Inspect to set it', tone: 'default' })} className="px-3 py-1 bg-emerald-300 rounded">Request Payout for selected</button>
            </div>
      </div>
    </div>
  );
}
