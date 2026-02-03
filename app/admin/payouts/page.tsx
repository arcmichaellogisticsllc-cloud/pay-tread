'use client';
import React, { useEffect, useState } from 'react';

export default function AdminPayoutsPage() {
  const [token, setToken] = useState('');
  const [rows, setRows] = useState<any[]>([]);

  async function load() {
    try {
      const res = await fetch('/api/admin/payouts', { headers: { 'x-admin-token': token } });
      const j = await res.json();
      setRows(j.data || []);
    } catch (e) { console.error(e); }
  }

  useEffect(() => {
    (async () => { await load(); })();
  }, []);

  async function action(id: string, act: string) {
    try {
      await fetch(`/api/admin/payouts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify({ action: act }) });
      load();
    } catch (e) { console.error(e); }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin — Payouts</h1>
      <div style={{ marginBottom: 12 }}>
        <label>Admin Token: <input value={token} onChange={e => setToken(e.target.value)} style={{ width: 400 }} /></label>
        <button onClick={load} style={{ marginLeft: 8 }}>Refresh</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th>Created</th><th>Load</th><th>Amount</th><th>Fee</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td>{r.loadId}</td>
              <td>{(r.amountCents/100).toFixed(2)}</td>
              <td>{(r.feeCents ?? 0)/100}</td>
              <td>{r.status}</td>
              <td>
                <button onClick={() => action(r.id, 'retry')}>Retry</button>
                {r.status !== 'FROZEN' ? (
                  <button style={{ marginLeft: 6 }} onClick={() => action(r.id, 'freeze')}>Freeze</button>
                ) : (
                  <button style={{ marginLeft: 6 }} onClick={() => action(r.id, 'unfreeze')}>Unfreeze</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
