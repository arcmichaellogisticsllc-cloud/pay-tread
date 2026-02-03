'use client';
import React from 'react';
import { useState } from 'react';

export default function AdminDashboard() {
  const [token, setToken] = useState('');
  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>
      <div style={{ marginBottom: 12 }}>
        <label>Admin Token (dev): <input value={token} onChange={e => setToken(e.target.value)} style={{ width: 400 }} /></label>
      </div>
      <ul>
        <li><a href="#" onClick={(e) => { e.preventDefault(); window.location.href = '/admin/transactions'; }}>View all transactions</a></li>
        <li><a href="#" onClick={(e) => { e.preventDefault(); window.location.href = '/admin/disputes'; }}>View load disputes</a></li>
        <li><a href="#" onClick={(e) => { e.preventDefault(); window.location.href = '/admin/users'; }}>User account management</a></li>
        <li><a href="#" onClick={(e) => { e.preventDefault(); window.location.href = '/admin/audit'; }}>Audit trail</a></li>
      </ul>
      <p style={{ color: '#666' }}>Tip: set an admin token in the input above to use the API from the UI (dev-only).</p>
    </div>
  );
}
