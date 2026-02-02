"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ToastProvider, useToasts } from "../components/ToastProvider";
import { IconRefresh, IconShieldCheck, IconWallet } from "../components/icons";

type Pod = {
  id: string;
  status: string;
};

type Load = {
  id: string;
  externalRef?: string;
  grossAmount: number;
  currency: string;
  status: string;
  pods: Pod[];
};

function DebugContent() {
    const [loads, setLoads] = useState<Load[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [ledger, setLedger] = useState<Array<any>>([]);
    const [walletId, setWalletId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string>('broker@example.com');
    const [me, setMe] = useState<any>(null);

    const toasts = useToasts();

    async function fetchLoads() {
      setLoading(true);
      try {
        const res = await fetch("/api/loads");
        const json = await res.json();
        setLoads(json.data ?? []);
      } catch (e) {
        setMessage(String(e));
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => {
      fetchLoads();
      fetchLedger();
      fetchMe(userEmail);
    }, []);

    async function fetchMe(email?: string) {
      try {
        const res = await fetch(`/api/users/me`, { headers: { 'x-user-email': email ?? userEmail } });
        const json = await res.json();
        setMe(json.data);
      } catch (e) {
        toasts.push({ message: 'Failed to load user', tone: 'error' });
      }
    }

    async function approvePod(loadId: string, podId: string) {
      setMessage(null);
      try {
        const res = await fetch(`/api/loads/${loadId}/pods/${podId}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approvedBy: userEmail }),
        });
        const json = await res.json();
        setMessage(JSON.stringify(json));
        toasts.push({ message: 'POD approved', tone: 'success' });
        // refresh loads
        fetchLoads();
        fetchLedger();
      } catch (e) {
        setMessage(String(e));
        toasts.push({ message: 'Failed to approve POD', tone: 'error' });
      }
    }

    async function requestPayout(loadId: string) {
      if (me?.kycStatus === 'UNVERIFIED') {
        toasts.push({ message: 'KYC required before requesting payouts', tone: 'error' });
        return;
      }

      const amount = prompt("Enter payout amount in cents (e.g. 50000 = $500):", "50000");
      if (!amount) return;
      const amountCents = Number(amount);
      if (Number.isNaN(amountCents) || amountCents <= 0) {
        toasts.push({ message: 'Invalid amount', tone: 'error' });
        return;
      }

      setMessage(null);
      try {
        const idempotency = `ui-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const res = await fetch(`/api/loads/${loadId}/payouts`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": idempotency },
          body: JSON.stringify({ amountCents, method: "instant_rtp", requestedBy: userEmail }),
        });
        const json = await res.json();
        setMessage(JSON.stringify(json));
        if (res.ok) toasts.push({ message: 'Payout requested', tone: 'success' });
        else toasts.push({ message: json?.error ?? 'Payout failed', tone: 'error' });
        // refresh loads & ledger
        fetchLoads();
        fetchLedger();
      } catch (e) {
        setMessage(String(e));
        toasts.push({ message: 'Payout request error', tone: 'error' });
      }
    }

    function walletBalanceFor(id: string | null) {
      if (!id) return 0;
      return ledger.filter((r) => r.walletId === id).reduce((s, r) => s + (r.amountCents ?? 0), 0);
    }

    function prettyMoney(cents: number) {
      return `$${(cents / 100).toFixed(2)}`;
    }

    async function fetchLedger() {
      try {
        const res = await fetch("/api/ledger");
        const json = await res.json();
        const rows = json.data ?? [];
        setLedger(rows);
        if (!walletId && rows.length) setWalletId(rows[0].walletId || null);
      } catch (e) {
        // ignore
      }
    }

    return (
      <div style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
        {/* Header bar inspired by a clean payment brand aesthetic */}
        <header style={{ background: 'var(--accent)', color: 'white', padding: '18px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontSize: 20, fontWeight: 800 }}>PayTread</span>
              <span style={{ fontSize: 12, opacity: 0.95, marginTop: 2 }}>Fast-pay for trucking</span>
            </div>
          </div>
        </header>

        <main style={{ padding: 24, background: '#f5f7fa', minHeight: 'calc(100vh - 72px)' }}>
          <div style={{ maxWidth: 980, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 18, marginBottom: 18, alignItems: 'flex-start' }}>
              <div style={{ flex: '0 0 360px' }}>
                {/* Wallet card - Mix PayPal/CashApp feel */}
                <div style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 4px 12px rgba(10,20,40,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7a90' }}>Available balance</div>
                      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6, color: '#0a2540' }}>{prettyMoney(walletBalanceFor(walletId))}</div>
                      <div style={{ fontSize: 12, color: '#6b7a90', marginTop: 6 }}>Wallet ID: <span style={{ color: '#0a2540', fontWeight: 600 }}>{walletId ?? '—'}</span></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button onClick={() => toasts.push({ message: 'Virtual card (coming soon)', tone: 'default' })} style={{ background: 'var(--success)', color: '#012a14', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Virtual Card</button>
                      <button onClick={() => toasts.push({ message: 'Send money (broker)', tone: 'default' })} style={{ background: '#f3f6fb', color: '#003087', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Send</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <button onClick={() => { fetchLoads(); fetchLedger(); }} style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e6eefc', background: '#fff', cursor: 'pointer' }}><IconRefresh /> Refresh</button>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href="/carrier"><button style={{ padding: '10px 12px', borderRadius: 8, border: 'none', background: '#eef6ff', color: 'var(--accent)' }}>Carrier</button></Link>
                      <Link href="/broker"><button style={{ padding: '10px 12px', borderRadius: 8, border: 'none', background: '#003087', color: '#fff' }}>Broker</button></Link>
                    </div>
                  </div>
                </div>

                {/* Quick actions - CashApp style small buttons */}
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <button onClick={() => { const l = loads[0]; if (l && l.pods[0]) approvePod(l.id, l.pods[0].id); }} style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#0070ba', color: '#fff', border: 'none', cursor: 'pointer' }}>Approve POD</button>
                  <button disabled={me?.kycStatus === 'UNVERIFIED'} onClick={() => { const l = loads[0]; if (l) requestPayout(l.id); }} style={{ flex: 1, padding: '10px', borderRadius: 10, background: me?.kycStatus === 'UNVERIFIED' ? '#f3f4f6' : '#00d084', color: me?.kycStatus === 'UNVERIFIED' ? '#9aa3b2' : '#012a14', border: 'none', cursor: me?.kycStatus === 'UNVERIFIED' ? 'not-allowed' : 'pointer' }}>{me?.kycStatus === 'UNVERIFIED' ? 'KYC required' : 'Quick Pay'}</button>
                </div>

                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <IconShieldCheck />
                    <div style={{ fontSize: 13 }}>KYC: <span style={{ fontWeight: 700 }}>{me?.kycStatus ?? '—'}</span></div>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0a2540' }}>Dashboard</h1>
                  <div>
                    <button onClick={() => { fetchLoads(); fetchLedger(); fetchMe(userEmail); }} style={{ marginRight: 12, padding: '8px 14px', background: '#eaf6ff', color: '#003087', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Refresh</button>
                  </div>
                </div>

                {/* Transactions (ledger) */}
                <div style={{ marginTop: 12, background: '#fff', padding: 12, borderRadius: 10, boxShadow: '0 2px 8px rgba(10,20,40,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>Recent activity</div>
                    <div style={{ fontSize: 12, color: '#6b7a90' }}>{ledger.length} transactions</div>
                  </div>
                  <div style={{ maxHeight: 280, overflow: 'auto' }}>
                    {ledger.map((tx: any) => (
                      <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 6px', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{tx.type.replaceAll('_', ' ')}</div>
                          <div style={{ fontSize: 12, color: '#6b7a90' }}>{new Date(tx.createdAt).toLocaleString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: tx.amountCents < 0 ? 'var(--danger)' : '#0a2540' }}>{prettyMoney(tx.amountCents)}</div>
                          <div style={{ fontSize: 12, color: '#6b7a90' }}>{tx.loadId ?? ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
        {loading && <div>Loading…</div>}
        <div className="space-y-4">
          {loads.map((load) => (
            <div key={load.id} className="p-4 border rounded">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{load.externalRef ?? load.id}</div>
                  <div className="text-sm text-slate-600">Status: {load.status}</div>
                  <div className="text-sm text-slate-600">Gross: {(load.grossAmount/100).toFixed(2)} {load.currency}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => requestPayout(load.id)} className="px-3 py-1 bg-green-200 rounded">Request Payout</button>
                  <button onClick={() => fetch(`/api/loads/${load.id}/payouts`).then(r=>r.json()).then(j=>setMessage(JSON.stringify(j))).catch(e=>setMessage(String(e)))} className="px-3 py-1 bg-slate-200 rounded">List Payouts</button>
                </div>
              </div>

              <div className="mt-3">
                <div className="font-sm font-medium">PODs</div>
                <div className="mt-2 space-y-2">
                  {load.pods.map((pod) => (
                    <div key={pod.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">{pod.id}</div>
                        <div className="text-xs text-slate-500">{pod.status}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => approvePod(load.id, pod.id)} className="px-2 py-1 bg-blue-200 rounded">Approve POD</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h2 className="font-semibold">Response</h2>
          <pre className="bg-black text-white p-3 rounded max-h-64 overflow-auto">{message ?? "(no response yet)"}</pre>
        </div>
          </div>
        </main>
      </div>
    );
  }

  export default function DebugPage() {
    return (
      <ToastProvider>
        <DebugContent />
      </ToastProvider>
    );
  }

