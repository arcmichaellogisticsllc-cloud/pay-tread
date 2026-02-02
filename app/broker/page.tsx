"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useToasts } from "../components/ToastProvider";

export default function BrokerPage() {
  const [me, setMe] = useState<any>(null);
  const [loads, setLoads] = useState<any[]>([]);
  const [newRef, setNewRef] = useState('LOAD-' + Math.floor(Math.random() * 9000 + 1000));
  const [rate, setRate] = useState('150000');
  const [carrierEmail, setCarrierEmail] = useState('carrier@example.com');
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
  const toasts = useToasts();

  useEffect(() => {
    fetch('/api/users/me', { headers: { 'x-user-email': 'broker@example.com' } })
      .then(r => r.json())
      .then(j => setMe(j.data))
      .catch(() => toasts.push({ message: 'Failed to load user', tone: 'error' }));

    refreshLoads();
  }, []);

  const refreshLoads = () => {
    fetch('/api/loads').then(r => r.json()).then(j => setLoads(j.data || [])).catch(() => setLoads([]));
  };

  // Step actions
  const submitRegistration = async () => {
    // Simulate registration by setting KYC to PENDING via a docs submit
    const res = await fetch(`/api/users/${me?.email ?? 'broker@example.com'}/docs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ docType: 'W9' }) }).catch(() => null);
    if (res?.ok) {
      toasts.push({ message: 'Registration submitted (docs uploaded)', tone: 'success' });
      // refresh user
      fetch('/api/users/me', { headers: { 'x-user-email': 'broker@example.com' } }).then(r => r.json()).then(j => setMe(j.data));
    } else {
      toasts.push({ message: 'Failed to submit registration', tone: 'error' });
    }
  };

  const postLoad = async () => {
  const body = { reference: newRef, shipperEmail: me?.email ?? 'broker@example.com', grossAmount: Number(rate), currency: 'USD', rateCents: Number(rate), paymentMethod: 'ACH' };
    const res = await fetch('/api/loads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      toasts.push({ message: 'Load posted', tone: 'success' });
      refreshLoads();
    } else {
      toasts.push({ message: j.error ?? 'failed to post load', tone: 'error' });
    }
  };

  const assignCarrier = async (loadId: string) => {
    const res = await fetch(`/api/loads/${loadId}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ carrierEmail }) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      toasts.push({ message: 'Carrier assigned', tone: 'success' });
      refreshLoads();
    } else {
      toasts.push({ message: j.error ?? 'failed assign', tone: 'error' });
    }
  };

  const createPayoutSplit = async (loadId: string) => {
    // Example: split 80% to carrier, 20% to broker
    const load = loads.find(l => l.id === loadId);
    if (!load) return toasts.push({ message: 'load not found', tone: 'error' });
    const gross = load.grossAmount ?? load.rateCents ?? 0;
    const carrierAmount = Math.floor(gross * 0.8);
    const brokerAmount = gross - carrierAmount;

    // create payout to carrier (requestedBy broker email)
    await fetch(`/api/loads/${loadId}/payouts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amountCents: carrierAmount, method: 'instant_rtp', requestedBy: me?.email }) });
    // create payout to broker (self)
    await fetch(`/api/loads/${loadId}/payouts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amountCents: brokerAmount, method: 'instant_rtp', requestedBy: me?.email }) });

    toasts.push({ message: 'Payout splits requested', tone: 'success' });
  };

  const submitPod = async (loadId: string) => {
    const res = await fetch(`/api/loads/${loadId}/pods`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uploadedByEmail: 'carrier@example.com', mime: 'application/pdf' }) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      toasts.push({ message: 'POD uploaded (mock)', tone: 'success' });
      refreshLoads();
    } else {
      toasts.push({ message: j.error ?? 'failed pod', tone: 'error' });
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Broker Dashboard</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/debug"><button style={{ padding: '8px 12px' }}>Debug</button></Link>
          <Link href="/carrier"><button style={{ padding: '8px 12px' }}>Carrier View</button></Link>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontSize: 14, color: '#6b7a90' }}>Signed in as</div>
          <div style={{ fontWeight: 700 }}>{me?.email ?? '—'}</div>
          <div className={`kyc-badge ${me?.kycStatus === 'UNVERIFIED' ? 'unverified' : ''}`}>{me?.kycStatus ?? 'UNKNOWN'}</div>
        </div>

        <div style={{ marginTop: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Broker Flow</h2>
          <ol style={{ marginTop: 8 }}>
            <li style={{ marginBottom: 8 }}><strong>Register as Broker/Dispatcher</strong> — <button onClick={submitRegistration} className="px-3 py-1 bg-slate-200 rounded">Submit W9/Docs</button></li>
            <li style={{ marginBottom: 8 }}><strong>Post Load / Link Shipper</strong> — reference <input value={newRef} onChange={e => setNewRef(e.target.value)} style={{ marginLeft: 8, padding: '4px 6px' }} /> Rate (cents) <input value={rate} onChange={e => setRate(e.target.value)} style={{ marginLeft: 8, padding: '4px 6px', width: 120 }} /> <button onClick={postLoad} className="px-3 py-1 bg-emerald-200 rounded" style={{ marginLeft: 8 }}>Post Load</button></li>
            <li style={{ marginBottom: 8 }}><strong>Assign Carrier</strong> — select a posted load then assign carrier by email <input value={carrierEmail} onChange={e => setCarrierEmail(e.target.value)} style={{ marginLeft: 8, padding: '4px 6px' }} /></li>
            <li style={{ marginBottom: 8 }}><strong>Payout Splits</strong> — request splits after POD/acceptance (click "Create Split" below on a load)</li>
            <li style={{ marginBottom: 8 }}><strong>Monitor Compliance</strong> — view KYC & documents in compliance queue (see Admin)</li>
            <li style={{ marginBottom: 8 }}><strong>Track Load Documents</strong> — upload POD (mock) and inspect</li>
          </ol>

          <div style={{ marginTop: 12 }}>
            <h3 style={{ fontSize: 14 }}>Your Loads</h3>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, marginTop: 8 }}>
              {loads.length === 0 ? <div style={{ padding: 12 }}>No loads</div> : loads.map(l => (
                <div key={l.id} style={{ padding: 8, borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{l.reference ?? l.externalRef}</div>
                    <div style={{ color: '#6b7280' }}>Status: {l.status} — Gross: ${(l.grossAmount/100).toFixed(2)}</div>
                    <div style={{ color: '#6b7280', marginTop: 6 }}>Pods: {(l.pods || []).length}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setSelectedLoadId(l.id); assignCarrier(l.id); }} className="px-3 py-1 bg-sky-200 rounded">Assign Carrier</button>
                    <button onClick={() => createPayoutSplit(l.id)} className="px-3 py-1 bg-amber-200 rounded">Create Split</button>
                    <button onClick={() => submitPod(l.id)} className="px-3 py-1 bg-lime-200 rounded">Upload POD</button>
                    <button onClick={() => setSelectedLoadId(l.id) } className="px-3 py-1 bg-slate-200 rounded">Inspect</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
