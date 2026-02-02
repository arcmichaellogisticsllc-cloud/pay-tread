import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const { payoutId, status, externalPaymentId, failureReason } = body;
    if (!payoutId || !status) return NextResponse.json({ error: 'missing_fields' }, { status: 400 });

    const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
    if (!payout) return NextResponse.json({ error: 'payout_not_found' }, { status: 404 });

    if (status === 'SENT') {
      await prisma.payout.update({ where: { id: payoutId }, data: { status: 'SENT', processedAt: new Date(), externalPaymentId } });
      await prisma.auditLog.create({ data: { actorId: payout.requestedBy ?? null, actionType: 'PAYOUT_SENT', targetType: 'PAYOUT', targetId: payoutId, payload: JSON.stringify({ externalPaymentId }) } });
      return NextResponse.json({ ok: true });
    }

    // Failure: mark payout failed and create reversal txn + restore wallet
    const walletTxn = await prisma.walletTransaction.findUnique({ where: { id: payout.walletTransactionId ?? '' } });
    const walletId = walletTxn?.walletId ?? null;

    await prisma.$transaction(async (tx: any) => {
      await tx.payout.update({ where: { id: payoutId }, data: { status: 'FAILED', failureReason: failureReason ?? 'unknown' } });
      if (walletId) {
        // compute previous balance after reversal conservatively
        const walletNow = await tx.wallet.findUnique({ where: { id: walletId } });
        const previousBalance = (walletNow?.balanceCents ?? 0) + payout.amountCents;
        // attribute reversal to the requesting user when possible, otherwise 'system'
        const createdBy = payout.requestedBy ?? 'system';
        await tx.walletTransaction.create({ data: { walletId: walletId, loadId: payout.loadId, type: 'PAYOUT_REVERSAL', amountCents: payout.amountCents, balanceAfterCents: previousBalance, metadata: JSON.stringify({ reason: failureReason }), createdBy } });
        await tx.wallet.update({ where: { id: walletId }, data: { balanceCents: { increment: payout.amountCents } } });
      }
    });

  // record audit for failed payout
  await prisma.auditLog.create({ data: { actorId: payout.requestedBy ?? null, actionType: 'PAYOUT_FAILED', targetType: 'PAYOUT', targetId: payoutId, payload: JSON.stringify({ failureReason }) } });

  return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'webhook_error', message }, { status: 500 });
  }
}
