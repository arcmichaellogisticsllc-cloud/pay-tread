// Simple smoke test for Inertia endpoints and pages
// Requires Node 18+ (global fetch). Run while the dev server is running.

async function ok(res) {
  if (!res.ok) {
    const txt = await res.text().catch(()=>'<no-body>');
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return res.json().catch(()=>null);
}

async function test() {
  const base = process.env.BASE || 'http://localhost:3000';
  console.log('Testing Inertia payload Broker...');
  const b = await ok(await fetch(`${base}/api/inertia/page?page=Broker`, { headers: { 'x-user-email': 'broker@example.com' } }));
  console.log('Broker payload component=', b.component);
  if (b.component !== 'Broker') throw new Error('Broker payload component mismatch');

  console.log('Testing Inertia payload Carrier...');
  const c = await ok(await fetch(`${base}/api/inertia/page?page=Carrier`, { headers: { 'x-user-email': 'carrier@example.com' } }));
  console.log('Carrier payload component=', c.component);
  if (c.component !== 'Carrier') throw new Error('Carrier payload component mismatch');

  console.log('Testing HTML pages /broker and /carrier (simple GET)');
  const pb = await fetch(`${base}/broker`);
  if (pb.status >= 400) throw new Error(`/broker returned ${pb.status}`);
  const pc = await fetch(`${base}/carrier`);
  if (pc.status >= 400) throw new Error(`/carrier returned ${pc.status}`);

  console.log('All Inertia endpoint checks passed.');
}

if (require.main === module) {
  test().then(()=>console.log('SMOKE OK')).catch(err=>{ console.error('SMOKE FAILED'); console.error(err); process.exit(2); });
}
