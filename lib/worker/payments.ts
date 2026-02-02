import { setTimeout as wait } from 'timers/promises';

// Simple in-memory payout worker for dev. Enqueue payouts for async settlement.
const queue: string[] = [];
let running = false;

export function enqueuePayoutForSettlement(payoutId: string) {
  queue.push(payoutId);
  if (!running) runWorker();
}

async function runWorker() {
  running = true;
  while (queue.length) {
    const payoutId = queue.shift()!;
    // random delay to simulate external rail
    const delayMs = 800 + Math.floor(Math.random() * 2200);
    await wait(delayMs);

    try {
      // POST a webhook to the local app to simulate settlement callback
      const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
      // randomly succeed or fail (90% success)
      const success = Math.random() < 0.9;
      const payload = {
        payoutId,
        status: success ? 'SENT' : 'FAILED',
        externalPaymentId: success ? `ext-${Date.now()}-${Math.floor(Math.random()*10000)}` : undefined,
        failureReason: success ? undefined : 'simulated_network_error'
      };

      await fetch(`${base}/api/webhooks/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('worker: failed to deliver webhook', err);
      // re-enqueue for retry
      queue.push(payoutId);
      await wait(2000);
    }
  }
  running = false;
}

export default { enqueuePayoutForSettlement };
