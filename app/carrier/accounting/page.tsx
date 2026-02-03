"use client";
import React, { useEffect, useState } from 'react';

export default function CarrierAccountingPage() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [me, setMe] = useState<any | null>(null);

  useEffect(() => {
    // get current user (server defaults to a dev email if none present)
    fetch('/api/users/me')
      .then(r => r.json()).then(j => setMe(j.data || null)).catch(() => setMe(null));
  }, []);

  useEffect(() => {
    if (!me) return;
    const emailQuery = `&email=${encodeURIComponent(me.email)}`;
      const s = start ? `&start=${encodeURIComponent(start)}` : '';
      const e = end ? `&end=${encodeURIComponent(end)}` : '';
      (async () => {
        setRows(null);
        try {
          const r = await fetch(`/api/reports/carrier/earnings?format=json${s}${e}${emailQuery}`);
          const j = await r.json();
          setRows(j.data || []);
        } catch (e) {
          setRows([]);
        }
      })();
  }, [me, start, end]);

  function downloadCSV(format: 'csv' | 'qb') {
    if (!me) return;
    const emailQuery = `&email=${encodeURIComponent(me.email)}`;
    const s = start ? `&start=${encodeURIComponent(start)}` : '';
    const e = end ? `&end=${encodeURIComponent(end)}` : '';
    const url = `/api/reports/carrier/earnings?format=${format}${s}${e}${emailQuery}`;
    window.location.href = url;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Carrier Accounting</h1>
      <p>Load-by-load earnings</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
        <label>Start: <input type="date" value={start} onChange={e => setStart(e.target.value)} /></label>
        <label>End: <input type="date" value={end} onChange={e => setEnd(e.target.value)} /></label>
        <button onClick={() => downloadCSV('csv')}>Download CSV</button>
        <button onClick={() => downloadCSV('qb')}>Download QuickBooks CSV</button>
      </div>

      <div>
        {rows === null ? <div>Loading...</div> : rows.length === 0 ? <div>No results</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Reference</th>
                <th>Gross</th>
                <th>Fees</th>
                <th>Payouts</th>
                <th>Net</th>
                <th>Approval</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.loadId} style={{ borderTop: '1px solid #eee' }}>
                  <td>{r.reference}</td>
                  <td style={{ textAlign: 'right' }}>{(r.grossAmount/100).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{((r.totalFees||0)/100).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{((r.totalPayouts||0)/100).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{((r.netAfterFees||0)/100).toFixed(2)}</td>
                  <td>{r.approvalAt ? new Date(r.approvalAt).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
