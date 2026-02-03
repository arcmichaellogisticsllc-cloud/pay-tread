'use client';
import React, { useEffect, useState } from 'react';

export default function AdminTransactionsPage() {
  const [token, setToken] = useState('');
  const [rows, setRows] = useState<any[]>([]);

  async function load() {
    try {
      const res = await fetch('/api/admin/reports/ledger', { headers: { 'x-admin-token': token } });
      const j = await res.json();
      setRows(j.data || []);
    } catch (e) { console.error(e); }
  }

  useEffect(() => {
    (async () => { await load(); })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin — Transactions</h1>
      <div style={{ marginBottom: 12 }}>
        <label>Admin Token: <input value={token} onChange={e => setToken(e.target.value)} style={{ width: 400 }} /></label>
        <button onClick={load} style={{ marginLeft: 8 }}>Refresh</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th>Created</th><th>Type</th><th>Amount</th><th>Wallet</th><th>Load</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td>{r.type}</td>
              <td>{(r.amountCents/100).toFixed(2)}</td>
              <td>{r.walletId}</td>
              <td>{r.loadId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
