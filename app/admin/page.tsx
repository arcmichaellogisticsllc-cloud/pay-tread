"use client";
import React, { useEffect, useState } from 'react';
import { optionList } from '../../lib/optionSets';

type Load = any;
type User = any;
type Wallet = any;

export default function AdminPage() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/loads').then(r => r.json()).then(j => setLoads(j.data || [])).catch(() => setLoads([]));
    fetch('/api/admin/users').then(r => r.json()).then(j => setUsers(j.data || [])).catch(() => setUsers([]));
    fetch('/api/admin/wallets').then(r => r.json()).then(j => setWallets(j.data || [])).catch(() => setWallets([]));
  }, []);

  const verifyKyc = async (id: string) => {
    setMessage('Verifying...');
    const res = await fetch(`/api/admin/users/${id}/kyc/verify`, { method: 'POST' });
    const j = await res.json().catch(() => ({ error: 'invalid' }));
    setMessage(JSON.stringify(j));
    // refresh users
    fetch('/api/admin/users').then(r => r.json()).then(j => setUsers(j.data || [])).catch(() => {});
  };

  const viewLedgerForWallet = async (walletId: string) => {
    const res = await fetch(`/api/ledger`);
    const j = await res.json().catch(() => ({}));
    const rows = j.data || [];
    const filtered = rows.filter((r:any) => r.walletId === walletId);
    setMessage(JSON.stringify(filtered, null, 2));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <section style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h2>Issue Queue</h2>
          <p style={{ color: '#6b7280' }}>View live wallet balances</p>
          <div>
            {wallets.length === 0 ? <div>No wallets</div> : wallets.map((w:any) => (
              <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{w.ownerEmail ?? w.owner?.email ?? 'wallet'}</div>
                  <div style={{ color: '#6b7280' }}>{(w.balanceCents/100).toFixed(2)} USD</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => viewLedgerForWallet(w.id)} className="px-3 py-1 bg-slate-200 rounded">View Ledger</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h2>Compliance Queue</h2>
          <p style={{ color: '#6b7280' }}>Review KYC, insurance, COI flags</p>
          <div>
            {users.length === 0 ? <div>No users</div> : users.map((u:any) => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{u.email}</div>
                  <div style={{ color: '#6b7280' }}>KYC: {u.kycStatus}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {u.kycStatus !== 'VERIFIED' && <button onClick={() => verifyKyc(u.id)} className="px-3 py-1 bg-amber-300 rounded">Verify KYC</button>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h2>Approve Finalizing Payouts</h2>
          <p style={{ color: '#6b7280' }}>Manual approval of high-risk payouts</p>
          <div>
            {loads.length === 0 ? <div>No loads</div> : loads.map((l:any) => (
              <div key={l.id} style={{ padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{l.reference || l.externalRef || l.id}</div>
                    <div style={{ color: '#6b7280' }}>Status: {l.status}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setMessage(JSON.stringify(l, null, 2))} className="px-3 py-1 bg-slate-200 rounded">Inspect</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Detail / Output</h3>
        <pre style={{ background: '#0f172a', color: '#e6eef8', padding: 12, borderRadius: 6, maxHeight: 320, overflow: 'auto' }}>{message ?? 'No output'}</pre>
      </div>
    </div>
  );
}
