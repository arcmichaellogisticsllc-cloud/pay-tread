import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import getUserFromReq from '../../../../../lib/getUserFromReq';
import { canViewLoad } from '../../../../../lib/permissions';
import { processPayoutSandbox } from "../../../../../lib/payments/sandbox";
import { calculatePayoutFee } from '../../../../../lib/payments/fees';
import worker from '../../../../../lib/worker/payments';
import { logAccess } from '../../../../../lib/accessLog';
import type { Prisma, Payout, WalletTransaction, Wallet } from '@prisma/client';

type RouteContext = { params?: Record<string, unknown> | Promise<Record<string, unknown>> };

export async function POST(req: Request, context: RouteContext) {
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    // support loadId coming from the URL param or as a fallback in the request body (helps tests/proxies)
  let paramLoadId: string | undefined = undefined;
  if (context && context.params) {
    const maybeParams = context.params;
    const params = (maybeParams && typeof (maybeParams as any).then === 'function') ? await (maybeParams as Promise<Record<string, unknown>>) : (maybeParams as Record<string, unknown>);
    paramLoadId = params?.loadId as string | undefined;
  }
    let loadId = paramLoadId ?? body.loadId;
    if (!loadId) {
      try {
        const path = new URL(req.url).pathname;
        const m = path.match(/\/api\/loads\/([^\/]+)\/payouts/);
        if (m) loadId = decodeURIComponent(m[1]);
      } catch (_) { /* ignore */ }
    }

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
  const actorEmail = (actor as any)?.email ?? (body as Record<string, unknown>).requestedBy ?? undefined;
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
      // Ensure the requesting user can view/participate in this load
      const canView = await canViewLoad(requestingUser, load);
      if (!canView) {
        return NextResponse.json({ error: 'forbidden', message: 'requesting user is not a participant in this load' }, { status: 403 });
      }
    // Prisma TS types in this workspace may not include kycStatus on the generated User type
    // so defensively read it via a runtime cast to avoid compile errors while still enforcing the check.
    const requestingUserKyc = (requestingUser as unknown && (requestingUser as { kycStatus?: string })?.kycStatus) ?? 'UNVERIFIED';
    if (requestingUserKyc !== 'VERIFIED') {
      return NextResponse.json({ error: 'kyc_required', message: 'KYC must be VERIFIED before requesting payouts' }, { status: 403 });
    }

    // Role-based payer/payee rules:
    // - Carrier, Broker, Shipper, Receiver may act as payer or payee (i.e., may request payouts)
    // - Dispatcher may NOT request payouts (they can only be recipients/payees)
  const requestingRole = (requestingUser as { roleId?: number })?.roleId ? await prisma.role.findUnique({ where: { id: (requestingUser as { roleId?: number }).roleId } }) : null;
  const requestingRoleName = requestingRole?.name ?? null;
    if (requestingRoleName === 'DISPATCHER') {
      return NextResponse.json({ error: 'role_not_allowed', message: 'Dispatcher role is not allowed to request payouts (dispatcher may only be a payee)' }, { status: 403 });
    }

  // Compute payout fee using the fee engine and enforce idempotency
  const feeCents = calculatePayoutFee(amountCents);
    const totalDebit = amountCents + feeCents;

    // Idempotency: if idempotencyKey provided, return existing
    if (idempotencyKey) {
      const existing = await prisma.payout.findUnique({ where: { idempotencyKey } });
      if (existing) return NextResponse.json({ message: "Idempotent: payout already exists", payout: existing });
    }

    // Guard: require an APPROVED payout request for this load before allowing payout creation
    const prLink = await prisma.payoutRequestToLoad.findFirst({ where: { loadId }, include: { payoutRequest: true } });
    if (!prLink || (prLink.payoutRequest.status !== 'APPROVED')) {
      return NextResponse.json({ error: 'approval_required', message: 'A payout must be authorized (approved) for this load before requesting funds' }, { status: 400 });
    }

    // Duplicate protection: prevent creating another non-failed payout for same load+amount
    const recentNonFailed = await prisma.payout.findFirst({ where: { loadId, amountCents, status: { not: 'FAILED' } } });
    if (recentNonFailed) {
      return NextResponse.json({ error: 'duplicate_payout_exists', message: 'A payout for this load and amount already exists', existingPayoutId: recentNonFailed.id }, { status: 409 });
    }

    // Perform an atomic debit: conditionally decrement wallet.balanceCents if sufficient
    let createdPayout: Payout | null = null;
    let createdTxn: WalletTransaction | null = null;
    let walletAfter: Wallet | null = null;

    try {
  const txResult = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // conditional decrement to avoid races
        // Require sufficient funds for amount + fee
        const updateResult = await tx.wallet.updateMany({ where: { id: wallet.id, balanceCents: { gte: totalDebit } }, data: { balanceCents: { decrement: totalDebit } } });
        if (updateResult.count === 0) {
          throw new Error('INSUFFICIENT_FUNDS');
        }

  const walletNow = await tx.wallet.findUnique({ where: { id: wallet.id } });
  if (!walletNow) throw new Error('WALLET_NOT_FOUND');

        const p = await tx.payout.create({ data: {
          loadId: load.id,
          idempotencyKey: idempotencyKey ?? undefined,
          amountCents: amountCents,
          method,
          status: 'REQUESTED',
          requestedBy: requestingUser.id,
        } });

        // create a payout transaction and a fee transaction so the ledger is explicit
        const payoutTxn = await tx.walletTransaction.create({ data: {
          walletId: wallet.id,
          loadId: load.id,
          type: 'PARTIAL_PAYOUT',
          amountCents: -amountCents,
          balanceAfterCents: walletNow.balanceCents,
          metadata: JSON.stringify({ method, feeCents }),
          createdBy: requestingUser.id,
        } });

        // if fee > 0 create separate fee txn
  let feeTxn: unknown = null;
        if (feeCents > 0) {
          feeTxn = await tx.walletTransaction.create({ data: {
            walletId: wallet.id,
            loadId: load.id,
            type: 'PAYOUT_FEE',
            amountCents: -feeCents,
            balanceAfterCents: (walletNow.balanceCents - amountCents),
            metadata: JSON.stringify({ reason: 'payout_fee' }),
            createdBy: requestingUser.id,
          } });
        }

  await tx.payout.update({ where: { id: p.id }, data: { walletTransactionId: payoutTxn.id } });

        return { p, payoutTxn, walletNow };
      });

      createdPayout = txResult.p as Payout;
      createdTxn = txResult.payoutTxn as WalletTransaction;
      walletAfter = txResult.walletNow as Wallet;
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'INSUFFICIENT_FUNDS') {
        return NextResponse.json({ error: 'insufficient_funds' }, { status: 400 });
      }
      throw e;
    }

  const finalizedPayout = createdPayout as Payout;

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
  // Access log entry for session/activity tracking
  await logAccess(requestingUser.id, 'PAYOUT_REQUEST_CREATED', { payoutId: finalizedPayout.id, loadId, amountCents });

    return NextResponse.json({ message: 'Payout queued for settlement', payoutId: finalizedPayout.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to create payout", message }, { status: 500 });
  }
}

export async function GET(req: Request, context: any) {
  try {
    // support loadId from URL param or fallback to query (helps dev/test callers)
    let paramLoadId: string | undefined = undefined;
    if (context && context.params) {
      const maybeParams = context.params as any;
      const params = (maybeParams && typeof maybeParams.then === 'function') ? await maybeParams : maybeParams;
      paramLoadId = params?.loadId;
    }
    const queryLoadId = new URL(req.url).searchParams.get('loadId');
    let loadId = paramLoadId ?? queryLoadId;
    if (!loadId) {
      try {
        const path = new URL(req.url).pathname;
        const m = path.match(/\/api\/loads\/([^\/]+)\/payouts/);
        if (m) loadId = decodeURIComponent(m[1]);
      } catch (_) { /* ignore */ }
    }
    if (!loadId) return NextResponse.json({ error: 'missing_load_id' }, { status: 400 });

    // allow lookup by DB id or externalRef
    const load = (await prisma.load.findUnique({ where: { id: loadId } }).catch(() => null as any)) ?? (await prisma.load.findUnique({ where: { externalRef: loadId } }).catch(() => null as any));
    if (!load) return NextResponse.json({ error: 'load_not_found' }, { status: 404 });

    const payouts = await prisma.payout.findMany({ where: { loadId }, include: { walletTransaction: true } });

    // Find any payout requests linked to this load
    const prLinks = await prisma.payoutRequestToLoad.findMany({ where: { loadId }, include: { payoutRequest: { include: { owner: true } } } });

    return NextResponse.json({ payouts, payoutRequests: prLinks });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_fetch_payouts', message }, { status: 500 });
  }
}
