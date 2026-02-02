// Minimal sandbox payments adapter for local testing.
// Exports a function that simulates processing a payout and returns a settlement result.

export async function processPayoutSandbox(payout: {
  id: string;
  amountCents: number;
  method: string;
}): Promise<{ status: "SENT" | "FAILED"; externalPaymentId?: string; failureReason?: string }>
{
  // simulate external processing latency
  await new Promise((res) => setTimeout(res, 300));

  // For sandbox, succeed for instant_rtp and same_day_ach; fail if amount is 0 or negative
  if (payout.amountCents <= 0) {
    return { status: "FAILED", failureReason: "invalid_amount" };
  }

  // deterministic external id for easy inspection
  const externalPaymentId = `sb-${payout.id}-${Date.now()}`;

  return { status: "SENT", externalPaymentId };
}

export default { processPayoutSandbox };
