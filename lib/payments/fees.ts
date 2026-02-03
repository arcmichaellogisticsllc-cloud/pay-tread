// Small fee calculation engine.
// For now use a configurable simple model: percentage + flat fee.

export function calculatePayoutFee(amountCents: number, opts?: { percent?: number; flatCents?: number }) {
  const percent = opts?.percent ?? 0.025; // 2.5%
  const flat = opts?.flatCents ?? 30; // $0.30
  if (amountCents <= 0) return 0;
  return Math.round(amountCents * percent) + flat;
}

export default { calculatePayoutFee };
