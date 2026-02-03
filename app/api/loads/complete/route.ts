import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import getUserFromReq from '../../../../lib/getUserFromReq';
import { approvePodCanonical } from '../../../../lib/pod/approve';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const loadId = body.loadId as string | undefined;
    if (!loadId) return NextResponse.json({ error: 'missing_load' }, { status: 400 });

    const user = await getUserFromReq(req);
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    const load = await prisma.load.findUnique({ where: { id: loadId }, include: { pods: true } });
    if (!load) return NextResponse.json({ error: 'load_not_found' }, { status: 404 });

    if (load.carrierId !== user.id) return NextResponse.json({ error: 'not_carrier_for_load' }, { status: 403 });

    const pod = load.pods && load.pods.length > 0 ? load.pods[0] : null;
    if (!pod) return NextResponse.json({ error: 'missing_pod' }, { status: 400 });

    const approveRes = await approvePodCanonical(pod.id, user.id);

    const carrier = await prisma.user.findUnique({ where: { id: user.id } });
    if (!carrier) return NextResponse.json({ error: 'carrier_not_found' }, { status: 404 });

    // If carrier has a persisted verification flag, allow instant payout
    const kycFlag = await prisma.userFlag.findFirst({ where: { userId: carrier.id, type: 'KYC_VERIFIED' } }).catch(() => null as any);
    const isVerified = !!kycFlag;
    if (isVerified) {
      const wallet = await prisma.wallet.findFirst({ where: { ownerId: carrier.id } });
      if (wallet) {
        const already = await prisma.payout.findFirst({ where: { loadId: load.id } });
        if (!already) {
          const amount = load.grossAmount;
          const payoutTxn = await prisma.walletTransaction.create({ data: { walletId: wallet.id, loadId: load.id, type: 'INSTANT_PAYOUT', amountCents: -amount, balanceAfterCents: (wallet.balanceCents || 0) - amount, metadata: JSON.stringify({ method: 'instant_rtp', note: 'Auto payout on POD approval' }), createdBy: user.id } });
          const payout = await prisma.payout.create({ data: { loadId: load.id, walletTransactionId: payoutTxn.id, amountCents: amount, method: 'instant_rtp', status: 'SENT', processedAt: new Date(), externalPaymentId: `sandbox-ext-${Date.now()}`, requestedBy: user.id } });
          await prisma.auditLog.create({ data: { actorId: user.id, actionType: 'PAYOUT_CREATED', targetType: 'Payout', targetId: payout.id, payload: JSON.stringify({ amount: payout.amountCents, method: payout.method }) } });
        }
      }
    }

    await prisma.load.update({ where: { id: load.id }, data: { status: 'DELIVERED', deliveredAt: new Date() } });
    await prisma.notification.create({ data: { forUserId: String(load.shipperId), message: `Load ${load.externalRef ?? load.id} completed by carrier`, link: `/loads/${load.id}` } }).catch(()=>null);
    await prisma.notification.create({ data: { forUserId: String((load as any).receiverId), message: `Load ${load.externalRef ?? load.id} completed and delivered`, link: `/loads/${load.id}` } }).catch(()=>null);

    return NextResponse.json({ data: { approved: approveRes, message: 'Load completed and payout processed (if KYC VERIFIED)' } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_complete', message }, { status: 500 });
  }
}
