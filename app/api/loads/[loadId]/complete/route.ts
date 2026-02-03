import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import getUserFromReq from '../../../../../lib/getUserFromReq';
import { approvePodCanonical } from '../../../../../lib/pod/approve';

type RouteContext = { params?: Record<string, unknown> };

export async function POST(req: Request, context: RouteContext) {
  try {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const { loadId: paramLoadId } = (context && (context.params ?? {})) as Record<string, unknown>;
  const loadId = (paramLoadId as string | undefined) ?? (body as Record<string, unknown>).loadId as string | undefined;
  if (!loadId) return NextResponse.json({ error: 'missing_load' }, { status: 400 });

  const user = await getUserFromReq(req);
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    const load = await prisma.load.findUnique({ where: { id: loadId }, include: { pods: true } });
    if (!load) return NextResponse.json({ error: 'load_not_found' }, { status: 404 });

    // ensure the actor is the assigned carrier
    if (load.carrierId !== user.id) return NextResponse.json({ error: 'not_carrier_for_load' }, { status: 403 });

    // find a submitted pod
    const pod = load.pods && load.pods.length > 0 ? load.pods[0] : null;
    if (!pod) return NextResponse.json({ error: 'missing_pod' }, { status: 400 });

    // approve pod (idempotent) - this creates LOAD_GROSS if not present
    const approveRes = await approvePodCanonical(pod.id, user.id);

    // create an immediate payout if carrier KYC is VERIFIED
    const carrier = await prisma.user.findUnique({ where: { id: user.id } });
    if (!carrier) return NextResponse.json({ error: 'carrier_not_found' }, { status: 404 });

  if (((carrier as { kycStatus?: string })?.kycStatus || 'UNVERIFIED') === 'VERIFIED') {
      // find carrier wallet
      const wallet = await prisma.wallet.findFirst({ where: { ownerId: carrier.id } });
      if (!wallet) return NextResponse.json({ error: 'wallet_not_found' }, { status: 400 });

      // create a payout txn only if not already created for this load (idempotent)
      const already = await prisma.payout.findFirst({ where: { loadId: load.id } });
      if (!already) {
        // debit wallet with payout equal to grossAmount (simple fast payout)
        const amount = load.grossAmount;

        // create negative wallet transaction representing payout
        const payoutTxn = await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            loadId: load.id,
            type: 'INSTANT_PAYOUT',
            amountCents: -amount,
            balanceAfterCents: (wallet.balanceCents || 0) - amount,
            metadata: JSON.stringify({ method: 'instant_rtp', note: 'Auto payout on POD approval' }),
            createdBy: user.id,
          },
        });

        const payout = await prisma.payout.create({
          data: {
            loadId: load.id,
            walletTransactionId: payoutTxn.id,
            amountCents: amount,
            method: 'instant_rtp',
            status: 'SENT',
            processedAt: new Date(),
            externalPaymentId: `sandbox-ext-${Date.now()}`,
            requestedBy: user.id,
          },
        });

        // audit
        await prisma.auditLog.create({ data: { actorId: user.id, actionType: 'PAYOUT_CREATED', targetType: 'Payout', targetId: payout.id, payload: JSON.stringify({ amount: payout.amountCents, method: payout.method }) } });
      }
    }

    // mark load delivered/completed
    await prisma.load.update({ where: { id: load.id }, data: { status: 'DELIVERED', deliveredAt: new Date() } });

    // notify shipper and receiver
  const l = load as unknown as { shipperId?: string; receiverId?: string; externalRef?: string; id: string };
  await prisma.notification.create({ data: { forUserId: l.shipperId as string, message: `Load ${l.externalRef ?? l.id} completed by carrier`, link: `/loads/${l.id}` } }).catch(()=>null);
  await prisma.notification.create({ data: { forUserId: l.receiverId as string, message: `Load ${l.externalRef ?? l.id} completed and delivered`, link: `/loads/${l.id}` } }).catch(()=>null);

    return NextResponse.json({ data: { approved: approveRes, message: 'Load completed and payout processed (if KYC VERIFIED)' } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_complete', message }, { status: 500 });
  }
}
