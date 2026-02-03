"use client";

import { useEffect, useState } from "react";

const SAMPLE_USERS = [
  'carrier@example.com',
  'broker@example.com',
  'shipper@example.com',
  'receiver@example.com',
  'dispatcher@example.com',
  'admin@example.com',
];

export default function NotificationBell() {
  const [selected, setSelected] = useState<string>(() => typeof window !== 'undefined' ? (localStorage.getItem('dev_user_email') || 'carrier@example.com') : 'carrier@example.com');
  const [notifs, setNotifs] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!selected) return;
    localStorage.setItem('dev_user_email', selected);
    fetch('/api/users/me/notifications', { headers: { 'x-user-email': selected } }).then(r => r.json()).then(j => setNotifs(j.data || [])).catch(() => setNotifs([]));
  }, [selected]);

  const unread = notifs.filter(n => !n.isRead).length;

  const markRead = async (id: string) => {
    await fetch('/api/users/me/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-email': selected }, body: JSON.stringify({ id }) });
    setNotifs(n => n.map((x:any) => x.id === id ? { ...x, isRead: true } : x));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <select value={selected} onChange={(e)=>setSelected(e.target.value)} style={{ padding: 6 }}>
        {SAMPLE_USERS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <div style={{ position: 'relative' }}>
        <button onClick={() => setOpen(o => !o)} aria-label="Notifications" style={{ padding: 6 }}>
          🔔 {unread > 0 ? <span style={{ color: '#dc2626', fontWeight: 700 }}>{unread}</span> : null}
        </button>
        {open ? (
          <div style={{ position: 'absolute', right: 0, marginTop: 6, width: 320, maxHeight: 360, overflow: 'auto', background: 'white', boxShadow: '0 6px 18px rgba(0,0,0,0.08)', borderRadius: 8, padding: 8, zIndex: 60 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <strong>Notifications</strong>
              <button onClick={() => { setNotifs([]); setOpen(false); }} style={{ fontSize: 12 }}>Close</button>
            </div>
            {notifs.length === 0 ? <div style={{ color: '#6b7280' }}>No notifications</div> : notifs.map(n => (
              <div key={n.id} style={{ padding: 8, borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {!n.isRead ? <button onClick={() => markRead(n.id)} style={{ fontSize: 12 }}>Mark read</button> : <span style={{ fontSize: 12, color: '#6b7280' }}>Read</span>}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
