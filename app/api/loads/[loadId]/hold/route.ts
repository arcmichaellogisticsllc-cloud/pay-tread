import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import getUserFromReq from '../../../../../lib/getUserFromReq';

export async function POST(req: Request, { params }: { params: { loadId: string } }) {
  try {
    const { loadId } = params;
    if (!loadId) return NextResponse.json({ error: 'missing_load' }, { status: 400 });

    const body = await req.json().catch(() => ({} as any));
    const amountCents: number = typeof body.amountCents === 'number' ? body.amountCents : undefined as any;

    const load = await prisma.load.findUnique({ where: { id: loadId } });
    if (!load) return NextResponse.json({ error: 'load_not_found' }, { status: 404 });

    const amount = amountCents ?? load.grossAmount;
    if (!amount || amount <= 0) return NextResponse.json({ error: 'invalid_amount' }, { status: 400 });

    // find shipper wallet
    let wallet = await prisma.wallet.findFirst({ where: { ownerId: load.shipperId } });
    if (!wallet) {
      return NextResponse.json({ error: 'shipper_wallet_not_found' }, { status: 404 });
    }

    // resolve actor (dev helper: x-user-email or ?email)
    const user = await getUserFromReq(req);
    const actorId = user?.id ?? null;

    // atomic conditional decrement: ensure wallet.balanceCents >= amount
    const updateResult = await prisma.wallet.updateMany({ where: { id: wallet.id, balanceCents: { gte: amount } }, data: { balanceCents: { decrement: amount }, pendingCents: { increment: amount } } });
    if (updateResult.count === 0) {
      return NextResponse.json({ error: 'insufficient_funds' }, { status: 402 });
    }

    // create a HOLD wallet transaction for shipper
    const lastTxn = await prisma.walletTransaction.findFirst({ where: { walletId: wallet.id }, orderBy: { createdAt: 'desc' } });
    const prevBalance = lastTxn ? lastTxn.balanceAfterCents : wallet.balanceCents;
    const afterBalance = prevBalance - amount;

    const wtx = await prisma.walletTransaction.create({ data: {
      walletId: wallet.id,
      loadId: load.id,
      type: 'HOLD',
      amountCents: -amount,
      balanceAfterCents: afterBalance,
      metadata: JSON.stringify({ note: 'Hold for load payment' }),
      createdBy: user?.id ?? 'system'
    } });

    // audit
    await prisma.auditLog.create({ data: { actorId: actorId, actionType: 'HOLD_CREATE', targetType: 'Load', targetId: loadId, payload: JSON.stringify({ amount }), } });

    return NextResponse.json({ data: { walletId: wallet.id, holdTx: wtx } }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_hold', message }, { status: 500 });
  }
}
