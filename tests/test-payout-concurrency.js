
const fetch = globalThis.fetch ?? require('node-fetch');

async function probeBase() {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  const candidates = [];
  for (let p = 3000; p <= 3010; p++) candidates.push(`http://localhost:${p}`);

  const timeoutMs = 1000;
  for (const base of candidates) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(`${base}/api/loads`, { signal: controller.signal });
      clearTimeout(id);
      // accept 200 and JSON
      const text = await res.text();
      try {
        JSON.parse(text);
        return base;
      } catch (e) {
        // not JSON, continue
      }
    } catch (e) {
      // connection failed, try next
    }
  }
  throw new Error('No running dev server found on localhost:3000-3010; set BASE_URL env to point to your app');
}

async function main(){
  const base = await probeBase();

  // get a load id
  const loadsRes = await fetch(`${base}/api/loads`);
  const loadsJson = await loadsRes.json();
  const load = loadsJson.data && loadsJson.data[0];
  if(!load){
    console.error('no loads found; create one first via POST /api/loads');
    process.exit(1);
  }
  const loadId = load.id;
  console.log('Using load', loadId);

  const concurrent = 6;
  const amount = 50000;

  const promises = [];
  for(let i=0;i<concurrent;i++){
  // include loadId in the body as a fallback in case the server doesn't populate URL params
  const idempotency = `concurrency-${i}-${Date.now()}`;
  const body = { loadId, amountCents: amount, method: 'instant_rtp', requestedBy: 'broker@example.com', idempotencyKey: idempotency };
  promises.push(fetch(`${base}/api/loads/${loadId}/payouts`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-email': 'broker@example.com', 'Idempotency-Key': idempotency }, body: JSON.stringify(body) }).then(r=>r.json()).then(j=>({ status: 'ok', resp: j })).catch(e=>({ status: 'err', error: String(e) })));
  }

  const results = await Promise.all(promises);
  console.log('Results:', results);
}

main().catch(e=>{ console.error(e); process.exit(1); });
