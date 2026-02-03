'use client';
import React, { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [token, setToken] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', { headers: { 'x-admin-token': token } });
      const j = await res.json();
      setUsers(j.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => {
    (async () => { await loadUsers(); })();
  }, []);

  async function setKyc(userId: string, kyc: string) {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify({ userId, action: 'setKYC', kycStatus: kyc }) });
    loadUsers();
  }

  async function toggleFreeze(userId: string, freeze: boolean) {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify({ userId, action: 'freeze', freeze }) });
    loadUsers();
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin — Users</h1>
      <div style={{ marginBottom: 12 }}>
        <label>Admin Token: <input value={token} onChange={e => setToken(e.target.value)} style={{ width: 400 }} /></label>
        <button onClick={loadUsers} style={{ marginLeft: 8 }}>Refresh</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th>Email</th><th>KYC</th><th>Profile</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderTop: '1px solid #eee' }}>
                <td>{u.email}</td>
                <td>{u.kycStatus}</td>
                <td><pre style={{ whiteSpace: 'pre-wrap' }}>{u.profile}</pre></td>
                <td>
                  <div style={{ marginBottom: 6 }}>
                    {(u.flags || []).map((f: any) => (
                      <span key={f.id} style={{ background: '#fee', color: '#700', padding: '2px 6px', borderRadius: 4, marginRight: 6 }}>{f.type}</span>
                    ))}
                  </div>
                  <button onClick={() => setKyc(u.id, 'VERIFIED')}>Set VERIFIED</button>
                  <button onClick={() => setKyc(u.id, 'PENDING')} style={{ marginLeft: 6 }}>Set PENDING</button>
                  <button onClick={() => toggleFreeze(u.id, true)} style={{ marginLeft: 6 }}>Freeze</button>
                  <button onClick={() => toggleFreeze(u.id, false)} style={{ marginLeft: 6 }}>Unfreeze</button>
                  <div style={{ marginTop: 6 }}>
                    <button onClick={async () => { await fetch(`/api/admin/aml/flags/${u.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify({ type: 'SUSPICIOUS', reason: 'manual_admin_flag' }) }); loadUsers(); }}>Flag SUSPICIOUS</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
