import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import getUserFromReq from '../../../../../lib/getUserFromReq';
import { processPayoutSandbox } from "../../../../../lib/payments/sandbox";
import worker from '../../../../../lib/worker/payments';

export async function POST(
  req: Request,
  { params }: { params: { loadId: string } }
) {
  try {
    const body = await req.json().catch(() => ({} as any));
    // support loadId coming from the URL param or as a fallback in the request body (helps tests/proxies)
    const { loadId: paramLoadId } = params ?? {} as any;
    const loadId = paramLoadId ?? body.loadId;

    if (!loadId) {
      return NextResponse.json(
        { error: "missing_load_id", message: "loadId is required in the URL or request body" },
        { status: 400 }
      );
    }
    const amountCents: number = body.amountCents;
    const method: string = body.method ?? "instant_rtp";
    const idempotencyKey: string | undefined = req.headers.get("Idempotency-Key") ?? body.idempotencyKey;
  // Resolve actor from request (dev helper reads x-user-email or ?email)
  const actor = await getUserFromReq(req);
  const actorEmail = actor?.email ?? body.requestedBy ?? undefined;
  const requestedBy = actorEmail ?? "system";

    if (!amountCents || amountCents <= 0) {
      return NextResponse.json({ error: "amountCents must be > 0" }, { status: 400 });
    }

    const load = await prisma.load.findUnique({ where: { id: loadId } });
    if (!load) return NextResponse.json({ error: "Load not found" }, { status: 404 });

    // load.carrierId may be null; fail early with a clear message so callers know to assign a carrier
    if (!load.carrierId) {
      return NextResponse.json({ error: 'carrier_not_assigned', message: 'Load has no carrier assigned' }, { status: 400 });
    }

    // Compute outstanding for load: gross - sum(payouts.amountCents) - sum(advances.amountCents)
    const payoutsAgg = await prisma.payout.aggregate({
      where: { loadId },
      _sum: { amountCents: true },
    });
    const advancesAgg = await prisma.advance.aggregate({ where: { loadId }, _sum: { amountCents: true } });

    const paid = payoutsAgg._sum.amountCents ?? 0;
    const advances = advancesAgg._sum.amountCents ?? 0;
    const outstanding = load.grossAmount - (paid + advances);

    if (amountCents > outstanding) {
      return NextResponse.json({ error: "Requested amount exceeds outstanding balance", outstanding }, { status: 400 });
    }

    // Find wallet
    const wallet = await prisma.wallet.findFirst({ where: { ownerId: load.carrierId } });
    if (!wallet) return NextResponse.json({ error: "Carrier wallet not found" }, { status: 404 });

    // Enforce KYC: requestedBy should be an existing user's email in dev
    if (!actorEmail) {
      return NextResponse.json({ error: 'requesting_user_not_provided', message: 'No requesting user (provide x-user-email or requestedBy)' }, { status: 400 });
    }
    const requestingUser = await prisma.user.findUnique({ where: { email: actorEmail } });
    if (!requestingUser) {
      return NextResponse.json({ error: 'requesting_user_not_found', message: 'requestingBy must be a valid user email' }, { status: 400 });
    }

    // Prisma TS types in this workspace may not include kycStatus on the generated User type
    // so defensively read it via a runtime cast to avoid compile errors while still enforcing the check.
    const requestingUserKyc = (requestingUser as any).kycStatus ?? 'UNVERIFIED';
    if (requestingUserKyc !== 'VERIFIED') {
      return NextResponse.json({ error: 'kyc_required', message: 'KYC must be VERIFIED before requesting payouts' }, { status: 403 });
    }

    // Idempotency: if idempotencyKey provided, return existing
    if (idempotencyKey) {
      const existing = await prisma.payout.findUnique({ where: { idempotencyKey } });
      if (existing) return NextResponse.json({ message: "Idempotent: payout already exists", payout: existing });
    }

    // Perform an atomic debit: conditionally decrement wallet.balanceCents if sufficient
    let createdPayout: any;
    let createdTxn: any;
    let walletAfter: any;

    try {
      const txResult = await prisma.$transaction(async (tx: any) => {
        // conditional decrement to avoid races
        const updateResult = await tx.wallet.updateMany({ where: { id: wallet.id, balanceCents: { gte: amountCents } }, data: { balanceCents: { decrement: amountCents } } });
        if (updateResult.count === 0) {
          throw new Error('INSUFFICIENT_FUNDS');
        }

        const walletNow = await tx.wallet.findUnique({ where: { id: wallet.id } });

        const p = await tx.payout.create({ data: {
          loadId: load.id,
          idempotencyKey: idempotencyKey ?? undefined,
          amountCents: amountCents,
          method,
          status: 'REQUESTED',
          requestedBy: requestingUser.id,
        } });

        const wtx = await tx.walletTransaction.create({ data: {
          walletId: wallet.id,
          loadId: load.id,
          type: 'PARTIAL_PAYOUT',
          amountCents: -amountCents,
          balanceAfterCents: walletNow.balanceCents,
          metadata: JSON.stringify({ method }),
          createdBy: requestingUser.id,
        } });

        await tx.payout.update({ where: { id: p.id }, data: { walletTransactionId: wtx.id } });

        return { p, wtx, walletNow };
      });

      createdPayout = txResult.p;
      createdTxn = txResult.wtx;
      walletAfter = txResult.walletNow;
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'INSUFFICIENT_FUNDS') {
        return NextResponse.json({ error: 'insufficient_funds' }, { status: 400 });
      }
      throw e;
    }

    const finalizedPayout = createdPayout;

    // Enqueue for async settlement (dev worker will POST to /api/webhooks/payments)
    await prisma.payout.update({ where: { id: finalizedPayout.id }, data: { status: 'PENDING' } });
    try {
      worker.enqueuePayoutForSettlement(finalizedPayout.id);
    } catch (e) {
      // If worker enqueue fails, mark payout failed
      await prisma.payout.update({ where: { id: finalizedPayout.id }, data: { status: 'FAILED', failureReason: 'enqueue_failed' } });
      return NextResponse.json({ error: 'enqueue_failed' }, { status: 500 });
    }

    // Audit log for payout request
    await prisma.auditLog.create({ data: { actorId: requestingUser.id, actionType: 'PAYOUT_REQUEST', targetType: 'Load', targetId: loadId, payload: JSON.stringify({ payoutId: finalizedPayout.id, amount: amountCents }) } });

    return NextResponse.json({ message: 'Payout queued for settlement', payoutId: finalizedPayout.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to create payout", message }, { status: 500 });
  }
}
