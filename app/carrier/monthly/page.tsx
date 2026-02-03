"use client";
import React, { useEffect, useState } from 'react';

export default function CarrierMonthlyPage() {
  const [rows, setRows] = useState<any[] | null>(null);

  useEffect(() => {
    // fetch last 30 days for demo
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth()-1, 1).toISOString();
    fetch(`/api/reports/carrier/earnings?start=${encodeURIComponent(start)}&format=json`, { headers: { 'x-user-email': 'carrier@example.com' } })
      .then(r => r.json()).then(j => setRows(j.data || [])).catch(() => setRows([]));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Carrier Monthly Summary</h1>
      <p>Summary of earnings for the selected period</p>
      {rows === null ? <div>Loading...</div> : (
        <div>
          <p>Total loads: {rows.length}</p>
          <p>Total gross: ${(rows.reduce((s, r) => s + (r.grossAmount||0), 0)/100).toFixed(2)}</p>
          <p>Total payouts: ${(rows.reduce((s, r) => s + (r.totalPayouts||0), 0)/100).toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
