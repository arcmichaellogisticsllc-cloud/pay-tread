'use client';
import React, { useEffect, useState } from 'react';

export default function AdminDisputesPage() {
  const [token, setToken] = useState('');
  const [data, setData] = useState<any>(null);

  async function load() {
    try {
      const res = await fetch('/api/admin/disputes', { headers: { 'x-admin-token': token } });
      const j = await res.json();
      setData(j.data || {});
    } catch (e) { console.error(e); }
  }

  useEffect(() => {
    (async () => { await load(); })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin — Disputes</h1>
      <div style={{ marginBottom: 12 }}>
        <label>Admin Token: <input value={token} onChange={e => setToken(e.target.value)} style={{ width: 400 }} /></label>
        <button onClick={load} style={{ marginLeft: 8 }}>Refresh</button>
      </div>
      <section>
        <h2>Ratings with issues</h2>
        {(data?.ratings || []).map((r: any) => (
          <div key={r.id} style={{ borderTop: '1px solid #eee', padding: 8 }}>
            <div><strong>Load:</strong> {r.loadId} | <strong>Score:</strong> {r.score}</div>
            <div><strong>Issue:</strong> {r.issueNotes}</div>
          </div>
        ))}
      </section>
      <section>
        <h2>Loads with dispute notes</h2>
        {(data?.loadsWithDisputeNote || []).map((l: any) => (
          <div key={l.id} style={{ borderTop: '1px solid #eee', padding: 8 }}>
            <div><strong>Load:</strong> {l.id} | <strong>Notes:</strong> {l.notes}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
