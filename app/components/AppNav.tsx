"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AppNav() {
  const [me, setMe] = useState<any | null>(null);
  useEffect(() => {
    fetch('/api/users/me')
      .then(r => r.json())
      .then(j => setMe(j.data || null))
      .catch(() => setMe(null));
  }, []);

  const role = me?.role ?? null;

  return (
    <nav style={{display: 'flex', gap: 12}}>
  <Link href="/" style={{color: 'inherit', textDecoration: 'none'}}>Home</Link>
  <Link href="/shipper" style={{color: 'inherit', textDecoration: 'none'}}>Shipper</Link>
      {(!role || role === 'BROKER' || role === 'ADMIN') && (
  <Link href="/broker" style={{color: 'inherit', textDecoration: 'none'}}>Broker</Link>
      )}
      {(!role || role === 'CARRIER' || role === 'ADMIN') && (
        <>
          <Link href="/carrier" style={{color: 'inherit', textDecoration: 'none'}}>Carrier</Link>
          <Link href="/carrier/accounting" style={{color: 'inherit', textDecoration: 'none'}}>Accounting</Link>
          <Link href="/carrier/monthly" style={{color: 'inherit', textDecoration: 'none'}}>Monthly</Link>
        </>
      )}
  <Link href="/dispatcher" style={{color: 'inherit', textDecoration: 'none'}}>Dispatcher</Link>
  <Link href="/receiver" style={{color: 'inherit', textDecoration: 'none'}}>Receiver</Link>
  {(!role || role === 'ADMIN') && <Link href="/admin" style={{color: 'inherit', textDecoration: 'none'}}>Admin</Link>}
  <Link href="/debug" style={{color: 'inherit', textDecoration: 'none'}}>Debug</Link>
    </nav>
  );
}
