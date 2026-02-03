(async function(){
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const ok = (c, msg) => console.log(`OK: ${msg}`);
  const fail = (c, msg) => { console.error(`FAIL: ${msg}`); process.exitCode = 2; };

  try {
    console.log('Fetching loads as admin...');
    let res = await fetch(base + '/api/loads', { headers: { 'x-user-email': 'admin@example.com' } });
    if (!res.ok) { fail(res.status, '/api/loads failed for admin'); return; }
    const loads = (await res.json()).data || [];
    if (!loads.length) { console.warn('WARN: no loads found (seed may be missing)'); }
    ok(0, 'admin can list loads');

  // Prefer testing against a load that likely has outstanding balance (seed creates LOAD-1001 and LOAD-SHIP-2001)
  const load = loads.find(l => l.externalRef === 'LOAD-1001') || loads[0];
    if (!load) { console.warn('No load to test further; exiting with success (partial)'); process.exit(0); }

    // Attempt payout as dispatcher (should be rejected)
    console.log('Attempting payout as dispatcher (should be rejected)...');
  // include loadId in body as a fallback in case route params are not forwarded
  res = await fetch(`${base}/api/loads/${load.id}/payouts`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-email': 'dispatcher@example.com' }, body: JSON.stringify({ loadId: load.id, amountCents: 100, method: 'instant_rtp' }) });
    const jp = await res.json().catch(()=>({}));
    if (res.status === 403 && (jp.error === 'role_not_allowed' || jp.error === 'forbidden')) {
      ok(0, 'dispatcher correctly rejected from requesting payout');
    } else {
      fail(0, `dispatcher payout test unexpected: status=${res.status} body=${JSON.stringify(jp)}`);
    }

    // Attempt Complete Load as shipper (should be forbidden since only assigned carrier may complete)
    console.log('Attempting to complete load as shipper (should be rejected)...');
    res = await fetch(`${base}/api/loads/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-email': 'shipper@example.com' }, body: JSON.stringify({ loadId: load.id }) });
    const jp2 = await res.json().catch(()=>({}));
    if (res.status === 403 || jp2.error === 'not_carrier_for_load' || jp2.error === 'forbidden') {
      ok(0, 'shipper correctly forbidden from completing load (only assigned carrier may)');
    } else {
      fail(0, `shipper complete unexpected: status=${res.status} body=${JSON.stringify(jp2)}`);
    }

    console.log('Permission tests completed.');
  } catch (e) {
    console.error('Error during tests', e);
    process.exitCode = 2;
  }
})();
