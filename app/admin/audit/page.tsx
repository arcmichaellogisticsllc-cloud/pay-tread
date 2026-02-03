'use client';
import React, { useEffect, useState } from 'react';

export default function AdminAuditPage() {
  const [token, setToken] = useState('');
  const [rows, setRows] = useState<any[]>([]);

  async function load() {
    try {
      const res = await fetch('/api/admin/audit', { headers: { 'x-admin-token': token } });
      const j = await res.json();
      setRows(j.data || []);
    } catch (e) { console.error(e); }
  }

  useEffect(() => {
    (async () => { await load(); })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin — Audit Log</h1>
      <div style={{ marginBottom: 12 }}>
        <label>Admin Token: <input value={token} onChange={e => setToken(e.target.value)} style={{ width: 400 }} /></label>
        <button onClick={load} style={{ marginLeft: 8 }}>Refresh</button>
      </div>
      <ul>
        {rows.map(r => (
          <li key={r.id} style={{ borderTop: '1px solid #eee', padding: 8 }}>
            <div><strong>{r.actionType}</strong> — {r.targetType} {r.targetId}</div>
            <div style={{ color: '#666' }}>{r.payload}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{new Date(r.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
