const fetch = global.fetch || require('node-fetch');

describe('Reports integration', () => {
  const BASE = 'http://localhost:3000';

  test('Carrier CSV responds', async () => {
    const res = await fetch(`${BASE}/api/reports/carrier/earnings?month=2026-02&format=csv`, { headers: { 'x-user-email': 'carrier@example.com' } });
    expect(res.status).toBe(200);
    const txt = await res.text();
    expect(txt).toMatch(/LoadReference,LoadId/);
  });

  test('Broker JSON responds', async () => {
    const res = await fetch(`${BASE}/api/reports/broker/payables`, { headers: { 'x-user-email': 'broker@example.com' } });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(Array.isArray(j.data)).toBe(true);
  });
});
